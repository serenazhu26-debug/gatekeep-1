import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import StyleInput from './pages/StyleInput'
import OutfitBuilder from './pages/OutfitBuilder'
import ShoppingList from './pages/ShoppingList'
import SavedOutfits from './pages/SavedOutfits'
import Auth from './pages/Auth'
import AccountHome from './pages/AccountHome'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#F5F5DC', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"               element={<Welcome />} />
          <Route path="/style-input"    element={<StyleInput />} />
          <Route path="/outfit-builder" element={<OutfitBuilder />} />
          <Route path="/shopping-list"  element={<ShoppingList />} />
          <Route path="/saved-outfits"  element={<SavedOutfits />} />
          <Route path="/auth"           element={<Auth />} />
          <Route path="/account"        element={<AccountHome />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
