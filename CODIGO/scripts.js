async function fetchGitHubData(username) {
    try {
        const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        alert(`Failed to fetch data: ${error.message}`);
        return [];
    }
}

function createBarChart(repos) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = repos.map(repo => repo.name);
    const stars = repos.map(repo => repo.stargazers_count);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Stars Count',
                data: stars,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createPieChart(repos) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    const languages = {};
    repos.forEach(repo => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    });
    const labels = Object.keys(languages);
    const data = Object.values(languages);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: 'black'
                    }
                }
            }
        }
    });
}

async function renderCharts(username) {
    const repos = await fetchGitHubData(username);
    if (repos.length > 0) {
        createBarChart(repos);
        createPieChart(repos);
    }
}

document.getElementById('githubForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('githubUsername').value.trim();
    if (username === "") {
        alert('The GitHub username field cannot be empty.');
    } 
    else {
        renderCharts(username);
    }
});