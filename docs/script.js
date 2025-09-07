let snakeSize = 21;
let snakeCells = ["11_11"];
let snakeDir = 0;

for (let r = 1; r < snakeSize + 1; r++) {
	for (let c = 1; c < snakeSize + 1; c++) {
		const cell = document.createElement("div");
		cell.id = `${c}_${r}`;
		cell.className = "bg-black";
		document.getElementById("snake-grid").append(cell);
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnApple() {
	let applePlaced = false;

	while (!applePlaced) {
		const appleCol = getRandomInt(1, 21);
		const appleRow = getRandomInt(1, 21);
		const appleCoords = `${appleCol}_${appleRow}`;
		const appleCell = document.getElementById(appleCoords);

		if (appleCell.className === "bg-black") {
			appleCell.className = "bg-red-600";
			applePlaced = true;
		}
	}
}

snakeLoop = setInterval(() => {
	snakeCells.forEach(function (cell) {
		document.getElementById(cell).className = "bg-lime-600";
	});
}, 100);

document.addEventListener("keydown", function (event) {
	switch (event.key) {
		case "ArrowUp":
			snakeDir = 1;
		case "ArrowRight":
			snakeDir = 2;
		case "ArrowDown":
			snakeDir = 3;
		case "ArrowLeft":
			snakeDir = 4;
	}
});
