'use client'

import React, {ChangeEvent, FormEvent, useRef, useState} from 'react';
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import InputGroup from "@/components/ui/input-group";
import {useUser} from "@/hooks/useUser";
import SpinnerIcon from "@/components/icons/SpinnerIcon";
import CSRFInput from "@/components/global/CSRFInput";

type LoginFormProps = {
  $t?: Record<string, any | Record<string, any>>
}

const LoginForm = ({$t}: LoginFormProps) => {
  const {setUser} = useUser()
  const tokenRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  })

  const [error, setError] = useState<{ message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({...credentials, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const token = tokenRef.current ? tokenRef.current.value : ""
      const res = await fetch("/api/login", {
        method: 'POST',
        body: JSON.stringify({...credentials, token}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
      })
      const data = await res.json()

      if (res.status === 200) {
        setUser({
          type: "login",
          data: {email: data.email}
        })
        router.push("/admin")
      } else if (res.status === 400) {
        setError({message: $t?.error.badRequest || "Failed to connect : Check your information"})
      } else if (res.status >= 500) {
        setError({message: $t?.error.server || "The service is temporally unavailable"})
      }
    } catch (err: any) {
      console.error(err)
      setError({message: $t?.error.server || "The service is temporally unavailable"})
    } finally {
      setLoading(false)
    }

    return
  }

  if (loading) {
    return <LoginLoading $t={$t}/>
  }

  return (
    <form onSubmit={handleSubmit}>
      <CSRFInput ref={tokenRef}/>
      <InputGroup>
        <Input
          id={"email"}
          value={credentials.email}
          autoComplete={"email"}
          onChange={handleChange}
          name={'email'}
          type={'email'}
          placeholder={$t?.login.email || "Email"}
          className={'bg-white'}
          aria-label={$t?.login.email || "Email"}
        />
      </InputGroup>
      <InputGroup>
        <Input
          id={"password"}
          value={credentials.password}
          autoComplete={"password"}
          onChange={handleChange}
          name={'password'}
          type={'password'}
          placeholder={$t?.login.password || "Password"}
          className={'bg-white'}
          aria-label={$t?.login.password || "Password"}
        />
      </InputGroup>
      {error && <div className={'text-sm text-red-700 text-center mt-3'}>{error.message}</div>}
      <Button
        type={'submit'}
        variant={'outline'}
        className={"w-full text-center mt-5 bg-gray-950 text-gray-50 hover:bg-gray-700 font-bold"}
      >
        {$t?.login.buttonLabel || "Login"}
      </Button>
    </form>
  );
};

type LoginLoadingProps = {
  $t?: Record<string, any>
}

const LoginLoading = ({$t}: LoginLoadingProps) => {
  return <div className={"w-full h-full flex flex-col justify-center items-center gap-3"}>
    <div className={"animate-spin dark:text-black"}>
      <SpinnerIcon size={24}/>
    </div>
    <div className={'font-bold dark:text-black'}>{$t?.login.loadingMessage || "Loading..."}</div>
  </div>
}

export default LoginForm;