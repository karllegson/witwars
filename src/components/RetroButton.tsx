import styled from 'styled-components';

interface RetroButtonProps {
  title: string;
  onClick: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}

const Button = styled.button<{
  disabled?: boolean;
}>`
  background: ${({ disabled }) => (disabled ? '#999' : '#ffcc00')};
  padding: 12px 16px;
  border-radius: 4px;
  border-width: 3px;
  border-style: solid;
  border-top-color: ${({ disabled }) => (disabled ? '#bbb' : '#ffffaa')};
  border-left-color: ${({ disabled }) => (disabled ? '#bbb' : '#ffffaa')};
  border-right-color: ${({ disabled }) => (disabled ? '#777' : '#aa8800')};
  border-bottom-color: ${({ disabled }) => (disabled ? '#777' : '#aa8800')};
  min-height: 50px;
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #000;
  text-align: center;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: filter 0.1s;
  &:active {
    filter: brightness(0.95);
  }
`;

export default function RetroButton({ title, onClick, style, disabled = false }: RetroButtonProps) {
  return (
    <Button onClick={onClick} style={style} disabled={disabled}>
      {title}
    </Button>
  );
} 