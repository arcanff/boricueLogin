document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log(e.target.children.id.value);
  console.log(e.target.children.names.value);
  console.log(e.target.children.dress.value);
  console.log(e.target.children.phone.value);
  console.log(e.target.children.mail.value);
  console.log(e.target.children.pass.value);
  console.log(e.target.children.rol.value);
  const res = await fetch('http://localhost:3000/api/user',{
    method:"POST",
    headers:{
      "Content-type":"application/json"
    },
    body: JSON.stringify({
      identificacion: e.target.children.id.value,
      nombres: e.target.children.names.value,
      direccion: e.target.children.dress.value,
      telefono: e.target.children.phone.value,
      correo: e.target.childre.mail.value,
      contrasena: e.target.children.pass.value,
      rol: e.target.children.rol.value,
      estado: 'Activo'
    })
  })
})

console.log("Hola");