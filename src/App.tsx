import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import StyleInput from './pages/StyleInput'
import OutfitBuilder from './pages/OutfitBuilder'
import ShoppingList from './pages/ShoppingList'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#FAF9F6', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"               element={<Welcome />} />
          <Route path="/style-input"    element={<StyleInput />} />
          <Route path="/outfit-builder" element={<OutfitBuilder />} />
          <Route path="/shopping-list"  element={<ShoppingList />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
