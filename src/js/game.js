// ==================== УТИЛИТЫ ====================
const Utils = {
    toChessNotation(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rank = 8 - row;
        return files[col] + rank;
    },

    fromChessNotation(pos) {
        const file = pos[0];
        const rank = parseInt(pos[1]);
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const col = files.indexOf(file);
        const row = 8 - rank;
        return { row, col };
    },

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },

    getPieceSymbol(piece) {
        const symbols = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };
        return symbols[piece.color][piece.type];
    },

    getPieceValue(type) {
        const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
        return values[type] || 0;
    },

    randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    getCellColor(row, col) {
        return (row + col) % 2 === 0 ? 'light' : 'dark';
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'warning' ? '#f39c12' : type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            border-radius: 10px;
            font-weight: bold;
            z-index: 9999;
            animation: slideIn 0.3s;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
};

// ==================== БАЗОВЫЙ КЛАСС ФИГУРЫ ====================
class Piece {
    constructor(color, type, row, col) {
        this.color = color;
        this.type = type;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
    }

    isValidTarget(row, col, board) {
        if (!Utils.isValidPosition(row, col)) return false;
        const target = board[row][col];
        return !target || target.color !== this.color;
    }

    clone() {
        const PieceClass = this.constructor;
        const cloned = new PieceClass(this.color, this.row, this.col);
        cloned.hasMoved = this.hasMoved;
        return cloned;
    }
}

// ==================== ПЕШКА ====================
class Pawn extends Piece {
    constructor(color, row, col) {
        super(color, 'pawn', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const dir = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // Ход вперед
        const oneStep = this.row + dir;
        if (Utils.isValidPosition(oneStep, this.col) && !board[oneStep][this.col]) {
            moves.push({ row: oneStep, col: this.col });
            
            // Ход на 2 клетки
            const twoStep = this.row + dir * 2;
            if (this.row === startRow && !board[twoStep][this.col]) {
                moves.push({ row: twoStep, col: this.col });
            }
        }

        // Взятие
        const captures = [
            { row: this.row + dir, col: this.col - 1 },
            { row: this.row + dir, col: this.col + 1 }
        ];

        captures.forEach(({ row, col }) => {
            if (Utils.isValidPosition(row, col)) {
                const target = board[row][col];
                if (target && target.color !== this.color) {
                    moves.push({ row, col, capture: true });
                }
            }
        });

        return moves;
    }
}

// ==================== ЛАДЬЯ ====================
class Rook extends Piece {
    constructor(color, row, col) {
        super(color, 'rook', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const dirs = [
            { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
            { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
        ];

        dirs.forEach(({ dr, dc }) => {
            let r = this.row + dr;
            let c = this.col + dc;

            while (Utils.isValidPosition(r, c)) {
                const target = board[r][c];
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ row: r, col: c, capture: true });
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        });

        return moves;
    }
}

// ==================== КОНЬ ====================
class Knight extends Piece {
    constructor(color, row, col) {
        super(color, 'knight', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const offsets = [
            { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
            { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
            { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
            { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
        ];

        offsets.forEach(({ dr, dc }) => {
            const r = this.row + dr;
            const c = this.col + dc;
            if (Utils.isValidPosition(r, c)) {
                const target = board[r][c];
                if (!target || target.color !== this.color) {
                    moves.push({ row: r, col: c, capture: !!target });
                }
            }
        });

        return moves;
    }
}

// ==================== СЛОН ====================
class Bishop extends Piece {
    constructor(color, row, col) {
        super(color, 'bishop', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        const dirs = [
            { dr: -1, dc: -1 }, { dr: -1, dc: 1 },
            { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
        ];

        dirs.forEach(({ dr, dc }) => {
            let r = this.row + dr;
            let c = this.col + dc;

            while (Utils.isValidPosition(r, c)) {
                const target = board[r][c];
                if (!target) {
                    moves.push({ row: r, col: c });
                } else {
                    if (target.color !== this.color) {
                        moves.push({ row: r, col: c, capture: true });
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        });

        return moves;
    }
}

// ==================== ФЕРЗЬ ====================
class Queen extends Piece {
    constructor(color, row, col) {
        super(color, 'queen', row, col);
    }

    getValidMoves(board) {
        const rook = new Rook(this.color, this.row, this.col);
        const bishop = new Bishop(this.color, this.row, this.col);
        return [...rook.getValidMoves(board), ...bishop.getValidMoves(board)];
    }
}

// ==================== КОРОЛЬ ====================
class King extends Piece {
    constructor(color, row, col) {
        super(color, 'king', row, col);
    }

    getValidMoves(board) {
        const moves = [];
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                
                const r = this.row + dr;
                const c = this.col + dc;

                if (Utils.isValidPosition(r, c)) {
                    const target = board[r][c];
                    if (!target || target.color !== this.color) {
                        moves.push({ row: r, col: c, capture: !!target });
                    }
                }
            }
        }

        return moves;
    }
}

// ==================== ДОСКА ====================
class ChessBoard {
    constructor() {
        this.cells = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.init();
    }

    init() {
        for (let row = 0; row < 8; row++) {
            this.cells[row] = Array(8).fill(null);
        }
    }

    setupInitialPosition() {
        this.init();

        // Белые
        this.cells[7][0] = new Rook('white', 7, 0);
        this.cells[7][1] = new Knight('white', 7, 1);
        this.cells[7][2] = new Bishop('white', 7, 2);
        this.cells[7][3] = new Queen('white', 7, 3);
        this.cells[7][4] = new King('white', 7, 4);
        this.cells[7][5] = new Bishop('white', 7, 5);
        this.cells[7][6] = new Knight('white', 7, 6);
        this.cells[7][7] = new Rook('white', 7, 7);
        
        for (let col = 0; col < 8; col++) {
            this.cells[6][col] = new Pawn('white', 6, col);
        }

        // Черные
        this.cells[0][0] = new Rook('black', 0, 0);
        this.cells[0][1] = new Knight('black', 0, 1);
        this.cells[0][2] = new Bishop('black', 0, 2);
        this.cells[0][3] = new Queen('black', 0, 3);
        this.cells[0][4] = new King('black', 0, 4);
        this.cells[0][5] = new Bishop('black', 0, 5);
        this.cells[0][6] = new Knight('black', 0, 6);
        this.cells[0][7] = new Rook('black', 0, 7);
        
        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', 1, col);
        }
    }

    getPiece(row, col) {
        return Utils.isValidPosition(row, col) ? this.cells[row][col] : null;
    }

    setPiece(row, col, piece) {
        if (!Utils.isValidPosition(row, col)) return false;
        this.cells[row][col] = piece;
        if (piece) {
            piece.row = row;
            piece.col = col;
        }
        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        const target = this.getPiece(toRow, toCol);
        if (target) {
            this.capturedPieces[target.color].push(target);
        }

        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        piece.hasMoved = true;

        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            color: piece.color,
            capture: !!target
        });

        return true;
    }

    getPiecesByColor(color) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece && piece.color === color) pieces.push(piece);
            }
        }
        return pieces;
    }

    getKingPosition(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece?.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isInCheck(color) {
        const kingPos = this.getKingPosition(color);
        if (!kingPos) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponents = this.getPiecesByColor(opponentColor);

        for (const piece of opponents) {
            const moves = piece.getValidMoves(this.cells);
            if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                return true;
            }
        }
        return false;
    }

    hasLegalMoves(color) {
        const pieces = this.getPiecesByColor(color);
        
        for (const piece of pieces) {
            const moves = piece.getValidMoves(this.cells);
            for (const move of moves) {
                const tempBoard = this.clone();
                tempBoard.movePiece(piece.row, piece.col, move.row, move.col);
                if (!tempBoard.isInCheck(color)) {
                    return true;
                }
            }
        }
        return false;
    }

    isCheckmate(color) {
        return this.isInCheck(color) && !this.hasLegalMoves(color);
    }

    isStalemate(color) {
        return !this.isInCheck(color) && !this.hasLegalMoves(color);
    }

    clone() {
        const newBoard = new ChessBoard();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece) newBoard.cells[row][col] = piece.clone();
            }
        }
        return newBoard;
    }

    render(boardElement) {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${Utils.getCellColor(row, col)}`;
                cell.dataset.row = row;
                cell.dataset.col = col;

                const piece = this.cells[row][col];
                if (piece) {
                    cell.textContent = Utils.getPieceSymbol(piece);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    getStatistics() {
        const white = this.getPiecesByColor('white');
        const black = this.getPiecesByColor('black');
        
        return {
            whiteCount: white.length,
            blackCount: black.length,
            whiteValue: white.reduce((s, p) => s + Utils.getPieceValue(p.type), 0),
            blackValue: black.reduce((s, p) => s + Utils.getPieceValue(p.type), 0)
        };
    }
}

// ==================== ИГРА ====================
class ChessGame {
    constructor() {
        this.board = new ChessBoard();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.moveCount = 0;
        
        this.boardElement = document.getElementById('chessBoard');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.turnText = document.getElementById('turnText');
        this.moveCounter = document.getElementById('moveCounter');
        this.whitePiecesCount = document.getElementById('whitePiecesCount');
        this.blackPiecesCount = document.getElementById('blackPiecesCount');
        this.gameProgress = document.getElementById('gameProgress');
        this.moveHistory = document.getElementById('moveHistory');
        this.capturedWhite = document.getElementById('capturedWhite');
        this.capturedBlack = document.getElementById('capturedBlack');
        this.victoryModal = document.getElementById('victoryModal');
        this.victoryMessage = document.getElementById('victoryMessage');
        
        this.newGameBtn = document.getElementById('newGameBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.resignBtn = document.getElementById('resignBtn');
        
        this.init();
    }

    init() {
        this.board.setupInitialPosition();
        this.render();
        this.attachEvents();
        this.updateUI();
    }

    attachEvents() {
        this.boardElement.addEventListener('click', (e) => this.handleClick(e));
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.resignBtn.addEventListener('click', () => this.resign());
    }

    handleClick(e) {
        if (this.gameOver) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const piece = this.board.getPiece(row, col);

        if (this.selectedPiece) {
            const move = this.possibleMoves.find(m => m.row === row && m.col === col);
            
            if (move) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.clearHighlights();
                this.selectedPiece = null;
                this.possibleMoves = [];
            } else {
                if (piece && piece.color === this.currentTurn) {
                    this.selectPiece(row, col);
                } else {
                    this.clearHighlights();
                    this.selectedPiece = null;
                    this.possibleMoves = [];
                }
            }
        } else {
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece) return;

        this.clearHighlights();
        
        this.selectedPiece = piece;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');

        const allMoves = piece.getValidMoves(this.board.cells);
        this.possibleMoves = allMoves.filter(move => {
            const tempBoard = this.board.clone();
            tempBoard.movePiece(piece.row, piece.col, move.row, move.col);
            return !tempBoard.isInCheck(this.currentTurn);
        });

        this.highlightMoves();
    }

    highlightMoves() {
        this.possibleMoves.forEach(move => {
            const cell = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            const target = this.board.getPiece(move.row, move.col);
            cell.classList.add(target ? 'possible-capture' : 'possible-move');
        });
    }

    clearHighlights() {
        document.querySelectorAll('.cell.selected, .cell.possible-move, .cell.possible-capture')
            .forEach(cell => {
                cell.classList.remove('selected', 'possible-move', 'possible-capture');
            });
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board.getPiece(fromRow, fromCol);
        const isCapture = !!this.board.getPiece(toRow, toCol);

        this.board.movePiece(fromRow, fromCol, toRow, toCol);
        this.moveCount++;

        this.checkGameOver();
        this.switchTurn();
        this.render();
        this.updateUI();
        this.addToHistory(fromRow, fromCol, toRow, toCol, piece, isCapture);
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.updateUI();
    }

    checkGameOver() {
        const opponent = this.currentTurn === 'white' ? 'black' : 'white';
        
        if (this.board.isCheckmate(opponent)) {
            this.gameOver = true;
            this.showVictory(`${this.currentTurn === 'white' ? 'Белые' : 'Чёрные'} победили матом!`);
        } else if (this.board.isStalemate(opponent)) {
            this.gameOver = true;
            this.showVictory('Ничья! Пат.');
        } else if (this.board.isInCheck(opponent)) {
            Utils.showNotification('Шах!', 'warning');
            this.highlightCheck(opponent);
        }
    }

    highlightCheck(color) {
        const kingPos = this.board.getKingPosition(color);
        if (kingPos) {
            const cell = document.querySelector(`[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`);
            cell.classList.add('check');
            setTimeout(() => cell.classList.remove('check'), 2000);
        }
    }

    showVictory(message) {
        this.victoryMessage.textContent = message;
        this.victoryModal.classList.add('active');
    }

    addToHistory(fromRow, fromCol, toRow, toCol, piece, isCapture) {
        const from = Utils.toChessNotation(fromRow, fromCol);
        const to = Utils.toChessNotation(toRow, toCol);
        
        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        moveItem.innerHTML = `
            <span class="move-number">${this.moveHistory.children.length + 1}.</span>
            <span>${isCapture ? 'x' : ''}${from}-${to}</span>
        `;
        this.moveHistory.appendChild(moveItem);
        this.moveHistory.scrollTop = this.moveHistory.scrollHeight;
    }

    updateUI() {
        this.turnIndicator.className = `turn-indicator ${this.currentTurn}-turn`;
        this.turnText.textContent = `Ход ${this.currentTurn === 'white' ? 'белых' : 'чёрных'}`;
        this.moveCounter.textContent = this.moveCount;

        const stats = this.board.getStatistics();
        this.whitePiecesCount.textContent = stats.whiteCount;
        this.blackPiecesCount.textContent = stats.blackCount;
        
        const total = stats.whiteValue + stats.blackValue;
        const progress = total > 0 ? (stats.whiteValue / total) * 100 : 50;
        this.gameProgress.style.width = `${progress}%`;

        this.capturedWhite.innerHTML = this.board.capturedPieces.white
            .map(p => Utils.getPieceSymbol(p)).join(' ');
        this.capturedBlack.innerHTML = this.board.capturedPieces.black
            .map(p => Utils.getPieceSymbol(p)).join(' ');
    }

    render() {
        this.board.render(this.boardElement);
    }

    newGame() {
        this.board = new ChessBoard();
        this.board.setupInitialPosition();
        this.currentTurn = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameOver = false;
        this.moveCount = 0;
        
        this.render();
        this.clearHighlights();
        this.updateUI();
        this.moveHistory.innerHTML = '';
        this.victoryModal.classList.remove('active');
    }

    undoMove() {
        Utils.showNotification('Функция отмены временно недоступна', 'error');
    }

    showHint() {
        const pieces = this.board.getPiecesByColor(this.currentTurn);
        const moves = [];

        for (const piece of pieces) {
            const validMoves = piece.getValidMoves(this.board.cells);
            for (const move of validMoves) {
                const tempBoard = this.board.clone();
                tempBoard.movePiece(piece.row, piece.col, move.row, move.col);
                if (!tempBoard.isInCheck(this.currentTurn)) {
                    moves.push({ piece, move });
                }
            }
        }

        if (moves.length > 0) {
            const hint = Utils.randomElement(moves);
            const cell = document.querySelector(`[data-row="${hint.move.row}"][data-col="${hint.move.col}"]`);
            cell.style.animation = 'pulse 1s 3';
            setTimeout(() => cell.style.animation = '', 3000);
            
            Utils.showNotification(`Подсказка: сходите на ${Utils.toChessNotation(hint.move.row, hint.move.col)}`);
        } else {
            Utils.showNotification('Нет доступных ходов!', 'warning');
        }
    }

    resign() {
        if (this.gameOver) return;
        if (confirm('Вы уверены, что хотите сдаться?')) {
            this.gameOver = true;
            const winner = this.currentTurn === 'white' ? 'черные' : 'белые';
            this.showVictory(`${winner} победили! Соперник сдался.`);
        }
    }
}

// ==================== ЗАПУСК ====================
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new ChessGame();
    window.game = game;
});
