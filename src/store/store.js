import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import userReducer from './reducers/user'

const rootReducer = combineReducers({
    userReducer: userReducer,
})
export const store = createStore(rootReducer, applyMiddleware(thunk))