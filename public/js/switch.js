function switchToPartA() {
  var partA = document.getElementById("partA");
  partA.style.display = partA.style.display === "block" ? "none" : "block";
}

function switchToPartB() {
  var partB = document.getElementById("partB");
  partB.style.display = partB.style.display === "block" ? "none" : "block";
}

function switchToPartB1() {
  var partB1 = document.getElementById("partB1");
  partB1.style.display = partB1.style.display === "block" ? "none" : "block";
}

function switchToPartB3() {
  var partB3 = document.getElementById("partB3");
  partB3.style.display = partB3.style.display === "block" ? "none" : "block";
}

window.onload = function () {
  document.getElementById("partB3").style.display = "none";
  document.getElementById("partB1").style.display = "none";
  document.getElementById("partA").style.display = "none";
  document.getElementById("partB").style.display = "none";
};
