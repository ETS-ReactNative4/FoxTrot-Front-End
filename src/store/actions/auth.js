import axios from 'axios'
import AsyncStorage from '@react-native-community/async-storage'

import { API_URL } from '../../global/variables'

export function logIn(phone_no, password) {
    return async (dispatch) => {
        if (phone_no === '' || password === '') {
            dispatch({ type: "LOGIN_ERROR_MSG", payload: "Textfields cannot be blank!" })
            return;
        }
        try {
            dispatch({ type: "SET_LOADING", payload: true })

            const res = await axios.post(`${API_URL}/login`, {
                phone_no: phone_no,
                password: password
            })
            // Save data in redux store
            dispatch({
                type: "LOGGED_IN",
                payload: {
                    token: res.data.token,
                    user_data: { phone_no: phone_no }
                },
            })
            // Save data in phone storage
            await AsyncStorage.setItem('user_data', JSON.stringify({ phone_no: phone_no }))
            await AsyncStorage.setItem('auth_token', res.data.token)
            dispatch({ type: "LOGIN_ERROR_MSG", payload: "" })
            return true
        }
        catch (err) {
            console.log(`Error logging in: ${err}`)
            dispatch({ type: "LOGIN_ERROR_MSG", payload: err.response?.data })
            return false
        }
        finally {
            dispatch({ type: "SET_LOADING", payload: false })
        }
    }
}

export function signUp(phone_no, password, re_password) {
    return async (dispatch) => {
        if (phone_no === '' || password === '' || re_password === '') {
            dispatch({ type: "SIGNUP_ERROR_MSG", payload: "Textfields cannot be blank!" })
            return false
        } else if (password !== re_password) {
            dispatch({ type: "SIGNUP_ERROR_MSG", payload: "Passwords do not match!" })
            return false
        }
        try {
            dispatch({ type: "SET_LOADING", payload: true })

            const res = await axios.post(`${API_URL}/signup`, {
                phone_no: phone_no,
                password: password
            })
            // Save data in phone storage
            await AsyncStorage.setItem('user_data', JSON.stringify({ phone_no: phone_no }))
            dispatch({ type: "SIGNUP_ERROR_MSG", payload: "" })
            return true
        }
        catch (err) {
            console.log(`Error signing up: ${err}`)
            dispatch({ type: "SIGNUP_ERROR_MSG", payload: err.response?.data })
            return false
        }
        finally {
            dispatch({ type: "SET_LOADING", payload: false })
        }
    }
}