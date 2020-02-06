import React from 'react'
import Layout from '../components/Layout'
import TwitterLoginButton from '../components/TwitterLoginButton'
import { useSelector } from 'react-redux'
import { Spin } from 'antd'
import firebase from '../plugins/firebase'
const twitterProvider = new firebase.auth.TwitterAuthProvider()

const handleSignIn = () => {
  firebase.auth().signInWithRedirect(twitterProvider)
}

const Login = () => {
  const isCheckingLogin = useSelector(state => state.isCheckingLogin)
  return (
    <Layout>
      <div className="text-center mt-20">
        <Spin spinning={isCheckingLogin} size="large">
          <h1 className="font-bold text-4xl mb-6">
            Login to AskMakers
          </h1>
          <p className="mb-5">
            Join a community of experts, share your best products and discover your next favorites tools.
          </p>
          <div className="w-full w-3/12 m-auto">
            <TwitterLoginButton handleLogin={handleSignIn} />
          </div>
        </Spin>
      </div>
    </Layout>
  )
}

export default Login