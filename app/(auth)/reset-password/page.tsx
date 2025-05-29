'use client'

import React, { Suspense, useEffect, useState } from "react"
import { useSignIn, useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from "sonner"

function ResetPasswordContent(){
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signIn, isLoaded: isSignInLoaded } = useSignIn() // Renombrar para calidad
  const { isSignedIn, isLoaded: isUserLoaded } = useUser() // Hook para verificar seción

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmiting, setIsSubmiting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const email = searchParams.get('email')

  const [resetFlowStarted, setResetFlowStarted] = useState(false) // Para asegurarse que signin.create se use solo una vex
  // ** Estado Principal 1: Redirigir si el usuario ya esta logeado **
  useEffect(() => {
    // Si el usuario está cargado y ya ha iniciado seción, redirigir
    if (isUserLoaded && isSignedIn){
      toast.info('Ya has iniciado sesión. Redirigiendo a tu página principal.')
      router.push('/')
    }
  }, [isUserLoaded, isSignedIn, router])
  // ** Estado Principal 2: Iniciar el flujo de rastreo de contraseña cuando sea apropiado **
  useEffect(() => {
    const startResetFlow = async () => {
      // Solo iniciar si:
      // 1. Hay un email en la URL
      // 2. Clerk (useSignIn) está cargado
      // 3. El flujo de reset aún no ha comenzado
      // 4. El usuario NO está logueado (¡Crucial para que este flujo funcione!)
      // 5. Los datos de usuario de Clerk están cargados
      if (!email || !isSignInLoaded || resetFlowStarted || isSignedIn || !isUserLoaded){
        return
      }

      setResetFlowStarted(true) // Marcar que iniciaremos el flujo

      try{
        await signIn.create({
          strategy: 'reset_password_email_code',
          identifier: email
        })
        toast.success('Se ha enviado un codigo de verificación a tu correo')
      } catch (err) {
        console.error('Error al iniciar el flujo de reset (signIn.create): ',err)
        // Manejar errores como email no encontrado o ya iniciada sesión
        if(typeof err === 'object' && err !== null && 'errors' in err && Array.isArray((err as { errors?: unknown }).errors)){
          const clerkErrors = (err as { errors: Array<{ code: string; message: string }> }).errors
          if(clerkErrors.some(e => e.code === 'user_already_signed_in')){
            // Este caso no deberia ocurrir si el primer useEffect de redirección funciona
            // Pero se mantiene por robustez
            setError('Ya as iniciado sesión. Redirigiendo...')
            toast.info('Ya has iniciado sesión. Redirigiendo a tu página principal')
            router.push('/')
          } else {
            setError(clerkErrors[0]?.message || 'Error al iniciar el proceso de cambio de contraseña')
          }
        } else {
          setError('Error al inicar el proceso de cambio de contraseña. Asegúrece que el email es correcto')
        }
        setResetFlowStarted(false)
      }
    }
    startResetFlow()
  }, [email, isSignInLoaded, resetFlowStarted, signIn, isSignedIn, isUserLoaded, router])
  // --- RESTO DEL COMPONENTE (CÓDIGO DE LAS FUNCIONES DE MANEJO DE EVENTOS) ---
  const resendVerificationCode = async () => {
    if (!email || !isSignInLoaded) {
      setError('No se puede reenviar el código en este momento')
      return
    }
    setIsResending(true)
    try{
      toast.info('Reenviando código...')
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email
      })
      toast.success("Código de verificación reenviado.");
    } catch (err) {
      console.error("Error al reenviar código:", err);
      setError("Error al reenviar el código. Inténtalo de nuevo.");
    } finally {
      setIsResending(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword || !verificationCode){
      setError('Todos los campos son requeridos')
      return
    }
    if (newPassword.length < 8){
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword){
      setError('Las contraseñas no coinciden')
      return
    }
    if (!isSignInLoaded || !resetFlowStarted){ // Asegurarse que el flujo haya iniciado
      setError('El proceso de rastreo no esta iniciado')
      return
    }
    setIsSubmiting(true)
    try{
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        password: newPassword,
        code: verificationCode
      })

      if(result.status === 'complete'){
        toast.success('Contraseña cambiada exitosamente. Serás redirigido')
        // Clerk automaticamente iniciará sesión al completar el reset
        setTimeout(() => {
          router.push('/') // Redirigir a la página principal despues del exito
        }, 1000)
      } else {
        setError('No se pudo completar el cambio de contraseña. Por favor, verifique el correo y la contraseña')
      }
    } catch (err: unknown){
      console.error('Error al intentar cambiar la contraseña: ',err)
      if (typeof err === 'object' && err !== null && 'errors' in err && Array.isArray((err as { errors: unknown }).errors)){
        const maybeErrors = (err as { errors: unknown }).errors
        if(Array.isArray(maybeErrors) && typeof maybeErrors[0] === 'object' && maybeErrors[0] !== null && 'message' in maybeErrors[0]){
          const typedErr = maybeErrors as { message?: string; code?: string }[]
          if(typedErr[0].code === 'form_code_incorrect'){
            setError('Código incorrecto. Por favor verifica el código recibido.')
          } else {
            setError(typedErr[0].message || 'Error al cambiar la contraseña.')
          }
        }
      } else {
        setError('Ocurrio un error inesperado.')
      }
    } finally {
      setIsSubmiting(false)
    }
  }
  // --- LÓGICA DE RENDERIZADO CONDICIONAL DE CARGA/ESTADO ---
  // Muestra un mensaje de carga o redirige si las condiciones no son las adecuadas para el formulario.
  if (!isUserLoaded || (isUserLoaded && isSignedIn) || isSignInLoaded || !email || !resetFlowStarted) {
    let message = 'Cargando...'
    if (!isUserLoaded) message = 'Verificando estado de sesión...'
    else if (isUserLoaded && isSignedIn) message = 'Ya has iniciado sesión. Redirigiendo...'
    else if (!email) message = 'Error: el correo electrónico no fue proporcionado. Vuelva a intentarlo desde el enlace de restablecimiento'
    else if (!isSignInLoaded) message = 'Cargando componentes de autenticación.'
    else if (!resetFlowStarted) message = `Iniciando proceso de restablecimiento para: ${email}`
    
    return(
      <div className="w-full min-h-screen flex justify-center items-center px-4">
        <p>{message}</p>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>      
    )
  }
  // --- RESTO DEL COMPONENTE (CÓDIGO DE LAS FUNCIONES DE MANEJO DE EVENTOS) ---
  // const resendVerificationCode = async () => {
  //   if (!email || !isSignInLoaded) {
  //     setError('No se puede reenviar el código en este momento')
  //     return
  //   }
  //   setIsResending(true)
  //   try{
  //     toast.info('Reenviando código...')
  //     await signIn.create({
  //       strategy: 'reset_password_email_code',
  //       identifier: email
  //     })
  //     toast.success("Código de verificación reenviado.");
  //   } catch (err) {
  //     console.error("Error al reenviar código:", err);
  //     setError("Error al reenviar el código. Inténtalo de nuevo.");
  //   } finally {
  //     setIsResending(false);
  //   }
  // }
  return(
    <div className="w-full min-h-screen flex justify-center items-center px-4">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md mx-auto p-4 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Cambiar Contraseña</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="space-y-2">
          <Label>Código de verificación</Label>
          <div className="flex gap-2">
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Código de 6 digitos"
              required
            />
            <Button
              type="button"
              variant='outline'
              onClick={resendVerificationCode}
              disabled={isResending}
            >
              {isResending ? 'Enviando...' : 'Reenviar código'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Se envió el código a: {email}
          </p>
        </div>
        <div className="space-y-2">
          <Label>Nueva Contraseña</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label>Confirmar contraseña</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            required
            autoComplete="new-password"
          />
        </div>
        <Button type='submit' disabled={isSubmiting || !isSignInLoaded} className="w-full">
          {isSignInLoaded ? 'Procesando...' : 'Cambiar contraseña'}
        </Button>
      </form>
    </div>
  )
}
export default function ResetPasswordPage(){
  return(
    <Suspense fallback={
      <div className="w-full min-h-screen flex justify-center items-center px-4">
        <p>Cargando formulario de cambio de contraseña</p>
      </div>
    }>
      <ResetPasswordContent/>
      <Toaster/>
    </Suspense>
  )
}