import "./App.css"
import Navbar from "./components/Navbar.tsx"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home.tsx"
import ActorDetails from "./pages/Actordetails.tsx"
import MovieList from "./pages/MovieList.tsx"
import MovieDetails from "./pages/MovieDetails.tsx"
import TopRated from "./pages/Toprated.tsx"
import Profile from "./pages/Profile.tsx"
import ComingSoon from "./pages/ComingSoon.tsx"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/actor/:id" element={<ActorDetails />} />
          <Route path="/top-rated" element={<TopRated />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
