let myChart; // Biến toàn cục cho biểu đồ

function trainModel() {
  const trainFile = document.getElementById('trainFile').files[0];
  const testFile = document.getElementById('testFile').files[0];
  const formData = new FormData();
  formData.append('train_file', trainFile);
  formData.append('test_file', testFile);

  updateProgressBar(30);

  axios.post('http://localhost:5000/upload-files', formData)
    .then(response => {
      alert(response.data.message);
      updateProgressBar(100);
      setTimeout(resetProgressBar, 1000);
    })
    .catch(error => {
      console.error('Training error:', error);
      alert('Lỗi trong quá trình huấn luyện.');
      resetProgressBar();
    });
}

function predict() {
  updateProgressBar(30);

  axios.post('http://localhost:5000/predict')
    .then(response => {
      const predictions = response.data.predictions;
      displayResults(predictions);
      updateChart(predictions[0]); 
      updateProgressBar(100);
      setTimeout(resetProgressBar, 1000);
    })
    .catch(error => {
      console.error('Prediction error:', error);
      alert('Lỗi trong quá trình dự đoán.');
      resetProgressBar();
    });
}

function displayResults(predictions) {
  const resultsBody = document.getElementById('resultsBody');
  resultsBody.innerHTML = ''; 

  let lowValueElements = []; 

  predictions.forEach((row, rowIndex) => {
    const rowElement = document.createElement('tr');
    row.forEach((value, index) => {
      const cell = document.createElement('td');
      cell.textContent = value.toFixed(4);
      
      if (Math.abs(value) < 5) {
        lowValueElements.push(`Phần tử ${index + 1}`);
    }

      rowElement.appendChild(cell);
    });
    resultsBody.appendChild(rowElement);
  });

  document.getElementById('resultsTable').style.display = 'table';

  updateLowValuesList(lowValueElements);
}

function updateLowValuesList(elements) {
  const lowValuesContainer = document.getElementById('lowValuesList');
  const lowValuesList = document.getElementById('lowValues');

  if (elements.length > 0) {
    lowValuesList.innerHTML = '';
    elements.forEach(element => {
      const listItem = document.createElement('li');
      listItem.textContent = element;
      lowValuesList.appendChild(listItem);
    });

    lowValuesContainer.style.display = 'block';
  } else {
    lowValuesContainer.style.display = 'none';
  }
}

function updateChart(data) {
  const ctx = document.getElementById('predictionChart').getContext('2d');

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 10 }, (_, i) => `Phần tử ${i + 1}`),
      datasets: [{
        label: 'Mức độ hư hỏng (%)',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Mức độ hư hỏng(%)',
            font: {
              family: 'Times New Roman',
              size: 17
            },
            color: 'black'
          },
          ticks: {
            font: {
              family: 'Times New Roman',
              size: 17
            },
            color: 'black'
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Times New Roman',
              size: 17
            },
            color: 'black'
          }
        }
      },
      plugins: {
        legend: {
          display: false // 
        }
      }
    },
    plugins: [
      {
        id: 'borderBox',
        beforeDraw: (chart) => {
          const { ctx, chartArea: { top, bottom, left, right } } = chart;
          ctx.save();
          ctx.strokeStyle = 'black';     // Viền đen
          ctx.lineWidth = 2;
          ctx.strokeRect(left, top, right - left, bottom - top);
          ctx.restore();
        }
      }
    ]
  });
}


function updateProgressBar(percentage) {
  const progressBar = document.getElementById('progress');
  document.getElementById('progressBar').style.display = 'block';
  progressBar.style.width = percentage + '%';
}

function resetProgressBar() {
  document.getElementById('progressBar').style.display = 'none';
  document.getElementById('progress').style.width = '0%';
}
