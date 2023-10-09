import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import './App.css';
import CubeDemo from './CubeDemo';
import LoadModel from './LoadModel';

const onChange = (key: string) => {
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Cube',
    children: <CubeDemo />,
  },
  {
    key: '3',
    label: 'Load Model',
    children: <LoadModel />,
  },
];

function App() {

  return (
    <div className="App">
      <h2>Three JS Demo</h2>
      <Tabs defaultActiveKey="3" items={items} onChange={onChange} />
    </div>
  );
}

export default App;
