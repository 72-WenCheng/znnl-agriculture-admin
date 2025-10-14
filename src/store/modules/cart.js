const STORAGE_KEY = 'mall_cart'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch(e){ return [] }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const state = {
  items: load()
}

const getters = {
  cartItems: state => state.items,
  cartCount: state => state.items.reduce((s,i)=>s+i.quantity,0),
  cartAmount: state => state.items.reduce((s,i)=>s+(i.price||0)*i.quantity,0)
}

const mutations = {
  ADD_ITEM(state, item) {
    const exist = state.items.find(x => x.sellproId === item.sellproId)
    if (exist) exist.quantity += item.quantity || 1
    else state.items.push({ ...item, quantity: item.quantity || 1 })
    save(state.items)
  },
  REMOVE_ITEM(state, id) {
    state.items = state.items.filter(x => x.sellproId !== id)
    save(state.items)
  },
  UPDATE_QTY(state, { id, quantity }) {
    const exist = state.items.find(x => x.sellproId === id)
    if (exist) exist.quantity = quantity
    save(state.items)
  },
  CLEAR_CART(state) {
    state.items = []
    save(state.items)
  }
}

const actions = {
  addToCart({ commit }, item) { commit('ADD_ITEM', item) },
  removeFromCart({ commit }, id) { commit('REMOVE_ITEM', id) },
  updateQty({ commit }, p) { commit('UPDATE_QTY', p) },
  clearCart({ commit }) { commit('CLEAR_CART') }
}

export default { namespaced: true, state, getters, mutations, actions } 