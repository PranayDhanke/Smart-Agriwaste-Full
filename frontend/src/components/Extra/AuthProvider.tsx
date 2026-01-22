"use client"

import { setToken } from "@/redux/features/authSlice"
import { useAuth } from "@clerk/nextjs"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export function AuthProvider() {
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  useEffect(() => {
    const loadToken = async () => {
      const token = await getToken()
      dispatch(setToken(token))
    }

    loadToken()
  }, [getToken, dispatch])

  return null
}
