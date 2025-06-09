class DrustvoPanel {
  constructor() {
    this.idPlayer = 1;
    this.showGames();
  }

  async showGames() {
    try {
      const res = await fetch(`/api/stats`);
      if (!res.ok) throw new Error('Error loading games.');
      const games = await res.json();
      this.showCards(games); 
    } catch (err) {
      console.error('Error:', err);
      alert('Error loading games: ' + err.message);
    }
  }

  showCards(games) {
    const container = document.getElementById('playerGames');
    container.innerHTML = games.map(p => `
      <div class="col">
        <div class="card h-100 shadow-sm pohod-card" data-id="${p.id}" style="cursor: pointer;">
          <div class="card-body">
            <h5 class="card-title">${p.game_name}</h5>
            <p class="card-text">
              <strong>Date:</strong> ${new Date(p.created_at).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
              })}<br>
              <strong>Score:</strong> ${p.total_score}<br>
              <strong>Rounds:</strong> ${p.total_rounds}
            </p>
            <button class="btn btn-danger btn-sm" onclick="panel.deleteGame(${p.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async deleteGame(id) {
    try {
      const res = await fetch(`/api/stats/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete game');
      
      showDeleteAlert('Game deleted successfully');
      this.showGames();
    } catch (err) {
      console.error(err);
      alert('Failed to delete game');
    }
  }
}

function showDeleteAlert(message, type = 'success') {
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show text-center" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  alertPlaceholder.append(wrapper);

  // Opcijsko: alert izgine po 3 sekundah
  setTimeout(() => {
    const alertNode = alertPlaceholder.querySelector('.alert');
    if (alertNode) {
      const alert = bootstrap.Alert.getOrCreateInstance(alertNode);
      alert.close();
    }
  }, 3000);
}


const panel = new DrustvoPanel();
