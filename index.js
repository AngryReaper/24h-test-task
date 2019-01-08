var source = "https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48";

// координаты аэропорта
var airX = 55.410307, airY = 37.902451;

function httpGet(url) {

  return new Promise(function(resolve, reject) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function() {
      if (this.status == 200) {
        var data = JSON.parse(xhr.responseText);
        resolve(data);
      } else {
        var error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = function() {
      reject(new Error("Network Error"));
    };

    xhr.send();
  });

}

// функция сортировщик списка рейсов
function Comparator(a, b) {
  if (Math.abs(a[0] - airX) < Math.abs(b[0] - airX)) return -1;
  if (Math.abs(a[0] - airX) > Math.abs(b[0] - airX)) return 1;
  
  if (Math.abs(a[1] - airY) < Math.abs(b[1] - airY)) return -1;
  if (Math.abs(a[1] - airY) > Math.abs(b[1] - airY)) return 1;
  
  return 0;
}

function generate(data) {
  // подгатавливаем переменные для отсортированнной коллекции данных и вставки в HTML
  var flights = new Array(0);
  var tbl = document.getElementsByTagName("table")[0];
  var tblBody;
  if (document.getElementsByTagName("tbody")[0] !== undefined) {
    tblBody = document.getElementsByTagName("tbody")[0];
    tblBody.parentNode.removeChild(tblBody);
  }
  tblBody = document.createElement("tbody");
  tbl.appendChild(tblBody);
  
  // перебираем исходные данные и если встреченное значение не массив, игнорируем его
  for (var key in data) {
    if (Array.isArray(data[key])) {

      var items = new Array(0);
      var speed = parseInt(data[key][5] * 1.852);
      var altitude = parseInt(data[key][4] / 3.281);
      items.push(data[key][1],data[key][2],speed,data[key][3],altitude,data[key][11],data[key][12],data[key][13]);
      flights.push(items);
    };
  };
  flights = flights.sort(Comparator);
  for (var flight of flights) {
    var row = document.createElement("tr");
    for (var i = 0; i < flight.length; i++) {
      var cell = document.createElement("td");
      var cellText = document.createTextNode(flight[i]);
      cell.appendChild(cellText);
      row.appendChild(cell);
    }
    tblBody.appendChild(row);
  }
}

const doResponse = (url) => {
  httpGet(url).then(
    response => generate(response),
    error => console.log(`Rejected: ${error}`)
  );
}

var startIntervals = setInterval(function() {
  doResponse(source)
}, 5000);