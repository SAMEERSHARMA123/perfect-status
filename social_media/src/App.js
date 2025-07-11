import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Main from './components/main/Main';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/profile';
import { ChatProvider } from './context/ChatContext';
import RegisterForm from './components/login/RegisterForm';
import Otp from './components/login/Otp';
import Login from './components/login/Login';
import Password_change from './components/password_change/Password_change';
import SearchPage from './components/searchPage/searchPage';
import { GetTokenFromCookie } from './components/getToken/GetToken';
import VideoCall from './components/videocall/VideoCall'; // or actual path

const VideoCallWrapper = () => {
  const { roomID } = useParams();
  const userID = String(Math.floor(Math.random() * 100000));
  const userName = "Sameer"; // replace with decoded name if available

  return <VideoCall roomID={roomID} userID={userID} userName={userName} />;
};

function App() {
  useEffect(() => {
    const decodedUser = GetTokenFromCookie();
    console.log("User Info:", decodedUser);
  }, []);

  return (
    <Router>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/otp" element={<Otp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change" element={<Password_change />} />
          <Route path="/search" element={<SearchPage />} />

          {/* ✅ New video call route */}
          <Route path="/video/:roomID" element={<VideoCallWrapper />} />
        </Routes>
      </ChatProvider>
    </Router>
  );
}

export default App;
