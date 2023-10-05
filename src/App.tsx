import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import * as THREE from 'three';
import './App.css';
import CubeDemo from './CubeDemo';

const onChange = (key: string) => {
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Cube',
    children: <CubeDemo />,
  },
  {
    key: '2',
    label: 'Drawing line',
    children: 'Content of Tab Pane 2',
  },
  {
    key: '3',
    label: 'Tab 3',
    children: 'Content of Tab Pane 3',
  },
];

function App() {

  return (
    <div className="App">
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
}

export default App;
