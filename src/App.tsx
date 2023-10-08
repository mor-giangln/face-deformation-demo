import type { TabsProps } from 'antd';
import { Image, Tabs } from 'antd';
import './App.css';
import CubeDemo from './CubeDemo';
import LoadModel from './LoadModel';
import SphereDemo from './SphereDemo';
import Angelica from './Angelica';
import { Suspense } from 'react';

const onChange = (key: string) => {
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'Cube',
    children: <CubeDemo />,
  },
  // {
  //   key: '2',
  //   label: 'Sphere',
  //   children: <SphereDemo />,
  // },
  // {
  //   key: '3',
  //   label: 'Load Model',
  //   children: <LoadModel />,
  // },
];

function App() {

  return (
    <div className="App">
      <h2>Three JS Demo</h2>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
}

export default App;
