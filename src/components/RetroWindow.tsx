import styled from 'styled-components';
import { X } from 'lucide-react';

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Window = styled.div`
  margin: 0 16px 16px 16px;
  background: #232323;
  border: 4px solid #333;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 24px 4px #111;
`;

// Increased border and shadow for main window above
const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1a1a;
  padding: 10px 12px;
  border-bottom: 2px solid #333;
`;

const TitleText = styled.span`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #fff;
`;

const Content = styled.div`
  background: #1a1a1a;
  padding: 0;
`;

export default function RetroWindow({ title, children, style }: RetroWindowProps) {
  return (
    <Window style={style}>
      <TitleBar>
        <TitleText>{title}</TitleText>
        {/* <button style={{ background: '#ff3333', borderRadius: 4, border: '1px solid #fff', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#fff" /></button> */}
      </TitleBar>
      <Content>{children}</Content>
    </Window>
  );
} 