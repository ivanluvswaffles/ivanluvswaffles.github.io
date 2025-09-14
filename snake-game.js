export class SnakeGame {
	constructor(gridId, options = {}) {
		// Game configuration
		this.rows = options.rows || 17;
		this.cols = options.cols || 17;
		this.speed = options.speed || 70;
		this.dieFromWalls =
			options.dieFromWalls !== undefined ? options.dieFromWalls : true;

		// Game state
		this.coords = ["8_8"];
		this.appleCoords = "";
		this.dirX = 0;
		this.dirY = 0;
		this.grid = [];
		this.lastTime = 0;
		this.isRunning = false;
		this.isPaused = false;
		this.score = 0;

		// DOM elements
		this.gridElement = document.getElementById(gridId);

		if (!this.gridElement) {
			throw new Error(`Element with id "${gridId}" not found`);
		}

		// Bind methods to maintain context
		this.handleKeyPress = this.handleKeyPress.bind(this);
		this.loop = this.loop.bind(this);

		this.init();
	}

	init() {
		this.setupGrid();
		this.bindEvents();
		this.placeApple();
		this.render();
		this.start();
	}

	setupGrid() {
		// Clear existing grid
		this.gridElement.innerHTML = "";
		this.gridElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

		// Create grid array and DOM elements
		for (let r = 0; r < this.rows; r++) {
			this.grid[r] = [];
			for (let c = 0; c < this.cols; c++) {
				const cell = document.createElement("div");
				cell.id = `${this.gridElement.id}_${c}_${r}`;
				cell.classList.add("border");
				this.gridElement.appendChild(cell);
				this.grid[r][c] = cell;
			}
		}
	}

	bindEvents() {
		document.addEventListener("keydown", this.handleKeyPress);
	}

	unbindEvents() {
		document.removeEventListener("keydown", this.handleKeyPress);
	}

	handleKeyPress(e) {
		const keyMap = {
			w: [0, -1],
			ArrowUp: [0, -1],
			a: [-1, 0],
			ArrowLeft: [-1, 0],
			s: [0, 1],
			ArrowDown: [0, 1],
			d: [1, 0],
			ArrowRight: [1, 0],
		};

		if (e.key === " ") {
			e.preventDefault();
			return this.reset();
		}

		if (e.key === "p" || e.key === "P") {
			e.preventDefault();
			return this.togglePause();
		}

		if (keyMap[e.key]) {
			e.preventDefault();
			const [x, y] = keyMap[e.key];
			// Prevent reversing into itself (unless snake is length 1)
			if (this.coords.length === 1 || (this.dirX !== -x && this.dirY !== -y)) {
				this.dirX = x;
				this.dirY = y;
			}
		}
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	placeApple() {
		let newApple;
		do {
			newApple = `${this.getRandomInt(0, this.cols - 1)}_${this.getRandomInt(
				0,
				this.rows - 1
			)}`;
		} while (this.coords.includes(newApple));
		this.appleCoords = newApple;
	}

	setCellColor(coord, color) {
		const [x, y] = coord.split("_").map(Number);
		if (this.grid[y] && this.grid[y][x]) {
			this.grid[y][x].style.backgroundColor = color;
		}
	}

	update() {
		if (!this.isRunning || this.isPaused) return true;

		let [headX, headY] = this.coords[0].split("_").map(Number);
		headX += this.dirX;
		headY += this.dirY;

		// Handle wall collisions
		if (this.dieFromWalls) {
			if (headX < 0 || headX >= this.cols || headY < 0 || headY >= this.rows) {
				this.gameOver();
				return false;
			}
		} else {
			// Wrap around walls
			headX = (headX + this.cols) % this.cols;
			headY = (headY + this.rows) % this.rows;
		}

		const newHead = `${headX}_${headY}`;

		// Check self collision (but not if snake is length 1)
		if (this.coords.includes(newHead) && this.coords.length > 1) {
			this.gameOver();
			return false;
		}

		// Add new head
		this.coords.unshift(newHead);

		// Check if apple was eaten
		if (newHead === this.appleCoords) {
			this.score++;
			this.placeApple();
			// Increase speed slightly
			this.speed = Math.max(30, this.speed - 1);
		} else {
			// Remove tail if no apple eaten
			const tail = this.coords.pop();
			this.setCellColor(tail, "");
		}

		return true;
	}

	render() {
		// Clear previous snake
		this.coords.slice(1).forEach((coord) => this.setCellColor(coord, "lime"));

		// Render snake head
		if (this.coords.length > 0) {
			this.setCellColor(this.coords[0], "#00ff00");
		}

		// Render apple
		this.setCellColor(this.appleCoords, "red");
	}

	loop(timestamp) {
		if (!this.isRunning) return;

		if (timestamp - this.lastTime >= this.speed) {
			this.lastTime = timestamp;
			if (this.update()) {
				this.render();
			}
		}

		if (this.isRunning) {
			requestAnimationFrame(this.loop);
		}
	}

	start() {
		if (this.isRunning) return;

		this.isRunning = true;
		this.isPaused = false;
		this.lastTime = 0;
		this.render();
		requestAnimationFrame(this.loop);
	}

	pause() {
		this.isPaused = true;
	}

	resume() {
		this.isPaused = false;
	}

	togglePause() {
		if (this.isPaused) {
			this.resume();
		} else {
			this.pause();
		}
	}

	stop() {
		this.isRunning = false;
		this.isPaused = false;
	}

	reset() {
		// Clear current snake and apple
		this.coords.forEach((coord) => this.setCellColor(coord, ""));
		this.setCellColor(this.appleCoords, "");

		// Reset game state
		this.coords = ["8_8"];
		this.appleCoords = "";
		this.dirX = 0;
		this.dirY = 0;
		this.lastTime = 0;
		this.score = 0;
		this.speed = 70; // Reset speed

		// Place new apple and start
		this.placeApple();
		this.render();
		this.start();
	}

	gameOver() {
		this.stop();
		console.log(`Game Over! Score: ${this.score}`);
		// You can add custom game over logic here
		// For example, show a modal, update high score, etc.
	}

	destroy() {
		this.stop();
		this.unbindEvents();
		this.gridElement.innerHTML = "";
	}

	// Getter methods for external access
	getScore() {
		return this.score;
	}

	getSnakeLength() {
		return this.coords.length;
	}

	isGameRunning() {
		return this.isRunning;
	}

	isGamePaused() {
		return this.isPaused;
	}
}
