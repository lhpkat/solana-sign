import React, { createContext, useContext } from 'react';
import { BrowserRouter, Route, Link } from "react-router-dom";
import { connect } from 'react-redux';
import { Layout, message } from 'antd';
import Routes from '../router/index';
import SiderContain from '../components/SiderContain';
import './App.css';
import { useEffect } from 'react';

const { Sider, Content } = Layout;


const App = ({ dispatch }) => {

  useEffect(() => {

  }, [])

  return (
    <div className="App">
      <Layout>
        <Sider
          width='20%'
          theme="light"
          className='sider-box'
        >
          <SiderContain />
        </Sider>
        <Layout>
          <Content>
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default connect()(App);
