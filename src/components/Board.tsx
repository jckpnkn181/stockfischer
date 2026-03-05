import { useState, useMemo, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import { kiwenSuwiPieces, PieceImg } from '../pieces/kiwenSuwi'

interface BoardProps {
  fen: string
  legalMoves: Map<string, string[]>
  orientation: 'white' | 'black'
  onMove: (from: string, to: string, promotion?: string) => boolean
  isPlayerTurn: boolean
  lastMove?: { from: string; to: string }
  isCheck: boolean
  kingSquare?: string
}

export default function Board({
  fen,
  legalMoves,
  orientation,
  onMove,
  isPlayerTurn,
  lastMove,
  isCheck,
  kingSquare,
}: BoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const isDraggingRef = useRef(false)
  const [promotionMove, setPromotionMove] = useState<{
    from: string
    to: string
  } | null>(null)

  const selectedMoves = useMemo(() => {
    if (!selectedSquare) return []
    return legalMoves.get(selectedSquare) || []
  }, [selectedSquare, legalMoves])

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
      styles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    }

    // Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        ...styles[selectedSquare],
        backgroundColor: 'rgba(20, 85, 30, 0.5)',
      }
    }

    // Legal move dots
    for (const sq of selectedMoves) {
      styles[sq] = {
        ...styles[sq],
        background: styles[sq]?.backgroundColor
          ? `radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%), ${styles[sq].backgroundColor}`
          : 'radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 25%)',
        borderRadius: '50%',
      }
    }

    // Check highlight
    if (isCheck && kingSquare) {
      styles[kingSquare] = {
        ...styles[kingSquare],
        backgroundColor: 'rgba(255, 0, 0, 0.6)',
      }
    }

    return styles
  }, [lastMove, selectedSquare, selectedMoves, isCheck, kingSquare])

  const isPromotionMove = useCallback(
    (from: string, to: string): boolean => {
      const piece = fen.split(' ')[0]
      // Check if a pawn is moving to the last rank
      const fromRank = from[1]
      const toRank = to[1]
      const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0)
      const fromRankNum = parseInt(fromRank)

      // Find what piece is on the from square in the FEN
      const rows = piece.split('/')
      const row = 8 - fromRankNum
      let col = 0
      for (const ch of rows[row]) {
        if (col === fromFile) {
          if ((ch === 'P' && toRank === '8') || (ch === 'p' && toRank === '1')) {
            return true
          }
          break
        }
        if (ch >= '1' && ch <= '8') {
          col += parseInt(ch)
        } else {
          col++
        }
      }
      return false
    },
    [fen]
  )

  const handleSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        return
      }
      if (!isPlayerTurn) return

      // If clicking a legal move destination
      if (selectedSquare && selectedMoves.includes(square)) {
        if (isPromotionMove(selectedSquare, square)) {
          setPromotionMove({ from: selectedSquare, to: square })
        } else {
          onMove(selectedSquare, square)
        }
        setSelectedSquare(null)
        return
      }

      // If clicking a piece with legal moves
      if (legalMoves.has(square)) {
        setSelectedSquare(square === selectedSquare ? null : square)
      } else {
        setSelectedSquare(null)
      }
    },
    [isPlayerTurn, selectedSquare, selectedMoves, legalMoves, onMove, isPromotionMove]
  )

  const handlePieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { pieceType: string }
      sourceSquare: string
      targetSquare: string | null
    }): boolean => {
      if (!isPlayerTurn || !targetSquare) return false
      if (sourceSquare === targetSquare) return false

      const movesForSquare = legalMoves.get(sourceSquare)
      if (!movesForSquare?.includes(targetSquare)) return false

      if (isPromotionMove(sourceSquare, targetSquare)) {
        setPromotionMove({ from: sourceSquare, to: targetSquare })
        return false
      }

      const success = onMove(sourceSquare, targetSquare)
      setSelectedSquare(null)
      return success
    },
    [isPlayerTurn, onMove, isPromotionMove, legalMoves]
  )

  const handlePieceDrag = useCallback(() => {
    isDraggingRef.current = true
    setSelectedSquare(null)
  }, [])

  const handlePromotion = useCallback(
    (piece: string) => {
      if (!promotionMove) return
      const roleMap: Record<string, string> = {
        q: 'queen',
        r: 'rook',
        b: 'bishop',
        n: 'knight',
      }
      onMove(promotionMove.from, promotionMove.to, roleMap[piece] || 'queen')
      setPromotionMove(null)
      setSelectedSquare(null)
    },
    [promotionMove, onMove]
  )

  return (
    <div className="relative w-full max-w-[min(100vw,80vh)] mx-auto">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: orientation,
          onPieceDrop: handlePieceDrop,
          onPieceDrag: handlePieceDrag,
          onSquareClick: handleSquareClick,
          squareStyles: customSquareStyles,
          darkSquareStyle: { backgroundColor: '#4d7a9a' },
          lightSquareStyle: { backgroundColor: '#eeeed2' },
          animationDurationInMs: 200,
          allowDragging: isPlayerTurn,
          pieces: kiwenSuwiPieces,
        }}
      />

      {/* Promotion Dialog */}
      {promotionMove && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded">
          <div className="flex gap-2 bg-[var(--bg-secondary)] p-4 rounded-lg shadow-xl">
            {['q', 'r', 'b', 'n'].map((piece) => (
              <button
                key={piece}
                onClick={() => handlePromotion(piece)}
                className="w-16 h-16 flex items-center justify-center text-4xl bg-[var(--bg-tertiary)] hover:bg-[var(--accent-green)] rounded-lg transition-colors cursor-pointer"
              >
                <PieceImg piece={piece.toUpperCase()} size="3rem" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
