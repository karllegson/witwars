import styled from 'styled-components';
import { X } from 'lucide-react';

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Window = styled.div`
  margin: 0 16px 16px 16px;
  background: #333344;
  border: 2px solid #666677;
  border-radius: 8px;
  overflow: hidden;
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #222233;
  padding: 10px 12px;
  border-bottom: 2px solid #444455;
`;

const TitleText = styled.span`
  font-family: 'VT323', monospace;
  font-size: 20px;
  color: #fff;
`;

const Content = styled.div`
  background: #222233;
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