function switchToPartA() {
  var partA = document.getElementById("partA");
  partA.style.display = partA.style.display === "block" ? "none" : "block";
}

function switchToPartB() {
  var partB = document.getElementById("partB");
  partB.style.display = partB.style.display === "block" ? "none" : "block";

  // Khởi tạo mục 2 và cập nhật danh sách phần tử hư hỏng từ mục 1
  if (typeof initializeSection2 === 'function') {
    setTimeout(initializeSection2, 100); // Delay nhỏ để đảm bảo UI đã render
  }
}

function switchToPartB1() {
  var partB1 = document.getElementById("partB1");
  partB1.style.display = partB1.style.display === "block" ? "none" : "block";
}

function switchToPartB3New() {
  var partB3New = document.getElementById("partB3New");
  partB3New.style.display = partB3New.style.display === "block" ? "none" : "block";

  // Khởi tạo mục 3 mới và cập nhật danh sách phần tử hư hỏng từ mục 1
  if (typeof initializeSection3New === 'function') {
    setTimeout(initializeSection3New, 100); // Delay nhỏ để đảm bảo UI đã render
  }
}

function switchToPartB4() {
  var partB4 = document.getElementById("partB4");
  partB4.style.display = partB4.style.display === "block" ? "none" : "block";
}

window.onload = function () {
  document.getElementById("partB4").style.display = "none";
  document.getElementById("partB3New").style.display = "none";
  document.getElementById("partB1").style.display = "none";
  document.getElementById("partA").style.display = "none";
  document.getElementById("partB").style.display = "none";
};
