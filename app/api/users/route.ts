'use server'

import { NextResponse } from 'next/server'
import { createClerkClient } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
// import { patchFetch } from 'next/dist/server/app-render/entry-base'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST( request: Request ) {
  try {
    // Ahora obtenemos el cuerpo de la solicitud
    const { nombre, email, role, password } = await request.json()

    // Validación basica de la contraseña
    if ( !password || password.length < 8 ) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      )
    }

    // Verificar la existencia del correo electrónico en Clerk antes de crear el usuario
    const existingUser = await clerk.users.getUserList({
      emailAddress: [email],
    })

    if ( existingUser.data.length > 0 ){
      console.error('Se requieren mas de 8 caracteres')
      return NextResponse.json(
        { success: false, error: 'El correo electrónico ya está en uso.' },
        { status: 400 }
      )
    }

    // Crear el usuario en Clerk con contraseña proporcionada
    const clerkUser = await clerk.users.createUser({
      firstName: nombre,
      emailAddress: [email],
      password: password, // usamos la contraseña del administrador
      skipPasswordRequirement: false,
      skipLegalChecks: false
    })

    // Almacenar el usuario en Convex
    // const userId = await fetchMutation(api.functions.user.createUser, {
    //   clerkId: clerkUser.id,
    //   nombre,
    //   email,
    //   role, // Asignar el rol proporcionado
    // })
    let userId;
    try {
      userId = await fetchMutation(api.functions.user.createUser, {
        clerkId: clerkUser.id,
        nombre,
        email,
        role,
      });
      console.log("Usuario creado en Convex:", userId);
    } catch (convexError) {
      console.error("Error al crear usuario en Convex:", convexError);
      throw convexError;
    }

    /* Enviar correo por Resend con la contraseña y el enlace de inicio de sesión 
       o un enlace a página donde pueda cambiarla ( si eligen hacerlo) */
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL // || 'http://localhost:3000'
    /* El enlace ya np es para -reset-password- de Clerk, sino una página de inicio de secion o un dashboard
       Opcionalmente, podría apuntar a una página personalizada como -/initial-setup- donde el usuario podria cambiar la contraseña*/
    const loginURL = `${baseURL}/sign-in` // Página de inicio de sesión estandar de Clerk
    // const changePasswordURL = `${baseURL}/change-password` // Una pagina personalizada para cambiar la contraseña

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error('RESEND_FROM_EMAIL no está definido en las variables de entorno.')
      return NextResponse.json(
        { success: false, error: 'Error de configuración del correo.' },
        { status: 500 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('correo proporcionado es inválido.')
      return NextResponse.json(
        { success: false, error: 'El correo electrónico proporcionado no es válido.' },
        { status: 400 }
      )
    }

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: '¡Bienevenido! tus credenciales de acceso',
      html: `
        <h1>Hola ${nombre} ¡Bienvenido a nuestra plataforma!</h1>
        <p>Tus credenciales de acceso son: </p>
        <p><strong>Correo: </strong> ${email}</p>
        <p><strong>Contraseña temporal: </strong> ${password}</p>
        <p>Por favor, inicia sesión en el siguiente enlace para cambiar tu contraseña y completar tu perfil:</p>
        <p><a href="${loginURL}">Iniciar sesión</a></p>
        <p>Si tienes problemas, copia y pega esta URL en el navegador: <br/>${loginURL}</p>
        <p>Atentamente, <br/>el equipo</p>
      `
    })

    if ( emailError) {
      console.error('Error sending welcome email from API route:', emailError)
      return NextResponse.json(
        { 
          success: true,
          clerkUserId: clerkUser.id,
          convexUserId: userId, //convexResut.id,
          message: `Usuario creado pero hubo un problema al enviar el correo de bienvenida: ${emailError.message}`
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      clerkUserId: clerkUser.id,
      convexUserId: userId,//convexResult.userId,
      emailId: emailResponse//emailResult?.id
    })

  } catch (error: unknown) {
    console.error('Full error creating user:', error)

    let errorMessage = 'Error desconocido al crear el usuario.'
    let statusCode = 500

    if ( typeof error === 'object' && error !== null ){
      if ( 'message' in error && typeof ( error as { message?: unknown }).message === 'string' ) {
        errorMessage = ( error as { message: string } ).message
      }
      if ( 'status' in error && typeof ( error as { status?: unknown }).status === 'number' ) {
        statusCode = ( error as { status: number } ).status
      }
      if ( 'errors' in error && Array.isArray(( error as { errors?: unknown }).errors) ) {
        const clerkErrors = (error as { errors: Array<{ code: string, message: string }> }).errors
        if (clerkErrors.length > 0){
          if ( clerkErrors[0].code === 'from_identifier_exists' ){
            errorMessage = 'El correo electrónico ya está en uso por el usuario de Clerk.'
            statusCode = 409
          } else {
            errorMessage = `Error de Clerk: ${clerkErrors[0].message}`
            statusCode = 400
          }
        }
      }
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}

export async function PATCH(request: Request) {
  try{
    const { id, clerkId, nombre, email, estado, role } = await request.json() // Resibe tambien -estado- para bloquear o desbloquear usuarios
    // Validación basica
    if ( !id || !clerkId ){ // id es el ID de Convex
      return NextResponse.json(
        { error: 'Missing requried fields (Convex ID or Clerk ID)' },
        { status: 400 }
      )
    }
    // Obtener usuario actual de Clerk para comparar correos
    const currentClerkUser = await clerk.users.getUser(clerkId)
    const currentPrimaryEmail = currentClerkUser.emailAddresses.find(email => email.id === currentClerkUser.primaryEmailAddressId)
    const currentPrimaryEmailAddress = currentPrimaryEmail?.emailAddress

    const updatesClerk: { firstName?: string; primaryEmailAddressID?: string } = {}
    const updatesConvex: { nombre?: string; email?: string; estado?: "activo" | "bloqueado" ; role?: string } = {}

    let newEmailCreatedId: string | null = null
    // let newEmailAddressToSet: string | undefined = undefined

    // Manejar actualizacion de nombre
    if ( nombre !== undefined && nombre !== currentClerkUser.firstName ) {
      updatesClerk.firstName = nombre
      updatesConvex.nombre = nombre
    }

    // Manejar actualizacion de correo (logica robusta)
    if ( email !== undefined && email !== currentPrimaryEmailAddress ) {
      // Verificar formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if ( !emailRegex.test(email) ) {
        return NextResponse.json(
          { error: 'El correo electrónico proporcionado no es válido.' },
          { status: 400 }
        )
      }

      // Verificar si el correo ya existe en Clerk
      const { data: existingUsersWithNewEmail } = await clerk.users.getUserList({
        emailAddress: [email],
      })

      if ( existingUsersWithNewEmail.length > 0 && existingUsersWithNewEmail[0].id !== clerkId ) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está en uso por otro usuario.' },
          { status: 400 }
        )
      }
      // Si el correo existe como dirección secundaria del usuario, solo lo hacemos primario
      const existingEmailAddressInClerk = currentClerkUser.emailAddresses?.find(ea => ea.emailAddress == email ) 

      if (existingEmailAddressInClerk){
        // Si ya existe, lo establecemos como primario
        await clerk.emailAddresses.updateEmailAddress(existingEmailAddressInClerk.id, {
          verified: true, // Asuminos que el admin lo está actualizando, por lo que puede ser verificado
          primary: true
        })
        updatesClerk.primaryEmailAddressID = existingEmailAddressInClerk.id
        newEmailCreatedId = existingEmailAddressInClerk.id // Para posible rollback
      } else {
        // Si no existe la creamos
        const newEmailObject = await clerk.emailAddresses.createEmailAddress({
          userId: clerkId,
          emailAddress: email
        })
        newEmailCreatedId = newEmailObject.id // Guarda el ID en caso de fallo
        // newEmailAddressToSet = newEmailObject.emailAddress // Guarda la dirección

        // Marcar como primaria y verificada inmediatamente (para admin)
        await clerk.emailAddresses.updateEmailAddress(newEmailObject.id,{
          verified: true,
          primary: true
        })
        updatesClerk.primaryEmailAddressID = newEmailObject.id
      }
      // Eliminar el correo anterior si es diferente al que existia
      if (currentPrimaryEmail && currentPrimaryEmail.id !== newEmailCreatedId){
        await clerk.emailAddresses.deleteEmailAddress(currentPrimaryEmail.id)
      }
      updatesConvex.email = email // Actualizar el correo en Convex
    }
    // Manejar actualización de rol
    if (role !== undefined){
      updatesConvex.role = role
      // Al usar roles publicos de Clerk, también se actualizaran aquí
      // await clerk.users.updateUser(clerkId, { publicMetadata: {role: role} })
    }
    // Manejar actualización de Estado (bloquear/desbloquear) - Solo en Convex si Clerk no maneja estado directamente
    if (estado !== undefined){
      updatesConvex.estado = estado
      // Si Clerk no tiene un campo de suspendido o similar, podria ser actualizado aquí
      // await clerk.users.updateUser(clerkId, { publicMetadata: {estado: estado} })
    }
    // Realizar actualización en Clerk, si hay algo que actualizar
    if (Object.keys(updatesClerk).length > 0){
      await clerk.users.updateUser(clerkId, updatesClerk)
    } 
    // Realizar actualización en Convex, si hay algo que actuañizar
    if(Object.keys(updatesConvex).length > 0){
      await fetchMutation(api.functions.user.updateUser, {
        id, // El ID de Convex 
        ...updatesConvex
      })
    }

    return NextResponse.json({
      success: true,
      message: "Usuario actiañozado exitosamente"
      // Es posivle devolver mas detalles de ser necesario
    })
  }catch(error: unknown){
    console.error("Full error updating user: ", error)

    let message = "Error dosconocido al actialzar el usuario"
    let status = 500
    let clerkTraceId = ""

    if(typeof error === "object" && error !== null){
      if("message" in error && typeof (error as { message?: unknown }).message === "string"){
        message = (error as { message: string }).message
      }
      if("status" in error && typeof (error as { status?: unknown }).status === "number"){
        status = (error as { status: number }).status
      }
      if("clerkTraceId" in error && typeof (error as { clerkTraceId?: unknown }).clerkTraceId === "string"){
        clerkTraceId = (error as { clerkTraceId: string }).clerkTraceId
      }

      if("errors" in error && Array.isArray((error as { errors: unknown }).errors)){
        const clerkErrors = (error as { errors: Array<{code: string; message: string}> }).errors
        if (clerkErrors[0].code === 'form_identifier_existis') {
          message = 'El nuevo correo electrónico ya está en uso por otro usuario en Clerk.'
          status = 409 // Conflict
        } else {
          message = `Clerk Error: ${clerkErrors[0].message}`
          status = 400 // Bad Request
        }
      }
    }
    /*
    RollBack para el correo (si se creó un nuvo email en Clerk pero falló algo después).
    Esto es muy complejo de hacer de forma robusta sin webshooks de Clerk o un sistema de colas.
    Por ahora, se asume que los errores en Clerk son detectados y manejados inmediatamente.
    Si la actualización en Convex falla después de Clerk, el estado sera inconsistente.
    */
    return NextResponse.json(
      { success: false, error: message, clerkTraceId },
      { status }
    )
  }
}

export async function DELETE(request: Request){
  try {
    const { clerkUserId, convexUserId } = await request.json() // Esperamos ambos IDs

    if (!clerkUserId || !convexUserId){
      return NextResponse.json({ error: 'Missing Clerk ID or Convex ID' }, { status: 400 })
    }
    // Eliminar usuario de Clerk
    await clerk.users.deleteUser(clerkUserId)
    // Eliminar usuario de Convex
    await fetchMutation(api.functions.user.deleteUser, {
      id: convexUserId
    })

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' })
  } catch (error: unknown) {
    console.error("Error eliminando usuario: ", error)

    let message = 'Error desconocido al eliminar usuario.'
    let status = 500

    if ( typeof error === "object" && error !== null ) {
      if ("message" in error && typeof (error as { message?: unknown }).message === 'string') {
        message = (error as { message: string }).message
      }
      if ("status" in error && typeof (error as { status?: unknown }).status === 'number') {
        status = (error as { status: number }).status
      }
      if ("errors" in error && Array.isArray( (error as { errors?: unknown }).errors )) {
        const clerkErrors = (error as { errors: Array<{ code: string; message: string }> }).errors
        if (clerkErrors.length > 0) {
          message = `Clerk Error: ${clerkErrors[0].message}`
          status = 400
        }
      }
    }
    return NextResponse.json({ success: false, error: message }, { status })
  }
}