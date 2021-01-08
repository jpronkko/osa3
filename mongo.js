// This file is for testing only
//


const mongoose = require('mongoose')

const dbname = 'phonebook'

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// Muokkaa mongon palauttamaa objektia
contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', contactSchema)

const connectDb = (dbname, password) => {
  const url =
        `mongodb+srv://muser:${password}@cygnusx1.vnhzd.mongodb.net/${dbname}?retryWrites=true&w=majority`

  try {
    mongoose.connect(
      url,
      { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
    ).then(() => console.log('Connected to ', dbname))
  } catch (error) {
    console.log(error)
  }
}

const closeDb = () => {
  mongoose.connection.close().then(() => {
    console.log('Connection closing: ')
  })
}

const createContact = (contactName, contactNumber) => {
  const person = new Person({
    name: contactName,
    number: contactNumber
  })

  return person.save().then(() => {
    console.log('Contact ', person, ' saved.')
  })
}

const getAll = () => {
  return Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(contact => {
      console.log(contact)
    })
  })
}

const processCmdLine = (dbname) => {

  const argc = process.argv.length

  if (argc !==3 && argc !==5) {
    console.log('give password or')
    console.log('password, name and number as arguments')
    process.exit(1)
  }

  const password = process.argv[2]
  connectDb(dbname, password)

  if (argc === 5) {
    const name = process.argv[3]
    const number = process.argv[4]
    createContact(name, number).then(() => closeDb())
  } else {
    getAll(dbname).then(() => closeDb())
  }
}

processCmdLine(dbname)

/*const note = new Note({
    content: 'Karu palikka',
    date: new Date(),
    important: true,
})*/

/*note.save().then(response => {
    console.log('note saved!')
    mongoose.connection.close()
})*/

/*
Note.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})*/

/*Note.find({ important: true }).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})*/

