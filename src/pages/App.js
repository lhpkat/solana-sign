import React, { useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { bindPushState } from '../lib';
import Routes from '../router/index';
import SiderContain from '../components/SiderContain';
import PageFooter from '../components/PageFooter';
import './App.css';

const { Footer, Sider, Content } = Layout;


const App = ({ dispatch }) => {
  let location = useLocation();
  useEffect(() => {
    bindPushState();
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
            <Routes />
          </Content>
          <Footer>
            {
              location.pathname !== '/' &&
              <PageFooter />
            }
          </Footer>
        </Layout>
      </Layout>
    </div>
  );
}

export default connect()(App);
