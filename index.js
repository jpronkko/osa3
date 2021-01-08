require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT

//const MAX_ID = 100000

morgan.token('content', (req) => {
  if (req.method === 'POST')
    return JSON.stringify(req.body)
  return ''
})

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] :response-time ms :content'))
app.use(express.static('build'))

/*let contacts = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 2,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendick',
    number: '39-23-6423122'
  },
]
*/


/*const generateId = () => {
  // const maxId = contacts.length > 0
  //       ? Math.max(...contacts.map(x => x.id))
  //       : 0
  //   return maxId + 1
  return Math.floor(Math.random() * MAX_ID)
}*/

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response, next) => {
  Person.estimatedDocumentCount((err, count) => {
    if (err) {
      console.log(err)
      response.status(404).end()
    } else {

      const message = `<p>Phonebook has info for ${count} people</p> 
        <p>${new Date()}</p>`
      response.send(message)
    }
  })
    .catch(error => next(error))

})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(result => {
    /* result.forEach(contact => {
             console.log(contact)
         })*/
    response.json(result)
  })
    .catch(error => next(error))
    /*    .catch(error => {
            console.log(error)
            response.status(500).end()
        })*/
  //response.json(contacts)
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
    /*.catch(error => {
        console.log(error)
        response.status(400).send({ error: 'malformed id' })
    })*/
  /* let id = Number(request.params.id)
     const person = contacts.find(x => x.id === id)
     if (!person) {
         response.status(400).json({
             error: `Person with id ${id} not found!`
         })
     }

     response.json(person)*/
})

app.post('/api/persons', (request, response, next) => {
  let body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'No name specified!'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'No number specified!'
    })
  }

  /*const hasPerson = contacts.find(x => x.name === body.name)
    if (hasPerson) {
        return response.status(400).json({
            error: `person ${hasPerson.name} was already in phone book!`
        })
    }*/

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(savedContact => savedContact.toJSON())
    .then(savedAndFormattedContact => {
      response.json(savedAndFormattedContact)
    })
    .catch(error => next(error))
    /*.catch(error => {
        console.log(error)
        response.status(500).end()
    })*/
  /*let person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    console.log(request.headers)
    contacts = contacts.concat(person)
    response.json(person)*/
})

app.put('/api/persons/:id', (request, response, next) => {


  // let id = Number(request.params.id)
  console.log('Put id:', request.params.id)

  let body = request.body

  /*if (!body.name) {
        return response.status(400).json({
            error: 'No name specified!'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'No number specified!'
        })
    }*/

  const contact = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    contact,
    { runValidators: true, context: 'query', new: true })
    .then(updatedContact => updatedContact.toJSON())
    .then(updatedAndFormattedContact => {
      return response.json(updatedAndFormattedContact)
    })
    .catch(error => next(error))

  /*contacts = contacts.map(
        x => x.id !== id ? x : { ...x, number: body.number }
    )
    response.status(200).end()*/
})

app.delete('/api/persons/:id', (request, response, next) => {

  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
    /*let id = Number(request.params.id)
    const person = contacts.find(x => x.id === id)
    if (!person) {
        response.status(400).json({
            error: `Person with id ${id} not found!`
        })
    }

    contacts = contacts.filter(x => x.id != id)
    response.status(204).end()*/
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  if(!PORT) {
    console.error('No listening port defined! Env var PORT must be set (via .env or otherwise)')
  } else {
    console.log(`Server running on port ${PORT}`)
  }
})

