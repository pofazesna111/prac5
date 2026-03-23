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
        const colors = {
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#27ae60'
        };
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${colors[type]};
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

// Добавляем анимацию для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

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
        this.capturedPieces = { white: [], black: [] };

        // Белые фигуры
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

        // Черные фигуры
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
        newBoard.moveHistory = [...this.moveHistory];
        newBoard.capturedPieces = {
            white: [...this.capturedPieces.white],
            black: [...this.capturedPieces.black]
        };
        return newBoard;
    }

    render(boardElement) {
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8;
