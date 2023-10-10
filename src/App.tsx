import type { TabsProps } from 'antd';
import { Tabs } from 'antd';
import './App.css';
import CubeDemo from './CubeDemo';
import LoadModel from './LoadModel';
import { useState } from 'react';

function App() {
  const [activeKey, setActiveKey] = useState<string>('2');

  const onChange = (key: string) => {
    setActiveKey(key);
  };
  
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Cube',
      children: <CubeDemo />,
    },
    {
      key: '2',
      label: 'Load Model',
      children: <LoadModel />,
    },
  ];

  return (
    <div className="App">
      <h2>Three JS Demo</h2>
      <div id="info">
			"W" translate | "E" rotate | "R" scale | "+/-" adjust size<br />
			"X" toggle X | "Y" toggle Y | "Z" toggle Z | "Spacebar" toggle enabled<br />
		</div>
      {activeKey === '2' ? <div id="debug1"/> : null}
      <Tabs defaultActiveKey={activeKey} items={items} activeKey={activeKey} onChange={onChange} />
    </div>
  );
}

export default App;
