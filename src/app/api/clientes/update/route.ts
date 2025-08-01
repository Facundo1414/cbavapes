import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const spreadsheetId = process.env.GOOGLE_SHEET_ID!
const sheetName = 'Clientes'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })

export async function GET() {
  const range = `${sheetName}!A2:L` // 12 columnas (A a L)
  const readRes = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  const rows = readRes.data.values || []

  const clients = rows.map((row, i) => ({
    clienteId: parseInt(row[0]) || i + 2, // ID en columna A (0)
    nombre: row[1] || '',
    telefono: row[2] || '',
    fechaCompra: row[3] || '',
    producto: row[4] || '',
    sabor: row[5] || '',
    precio: parseFloat(row[6]) || 0,
    pagado: row[7] || 'No',
    entregado: row[8] || 'No',
    seguimiento: row[9] || 'No',
    cupon: row[10] || 'FALSE',
    notas: row[11] || '',
  }))

  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      nombre,
      telefono,
      fechaCompra,
      producto,
      sabor,
      precio,
      pagado = 'No',
      entregado = 'No',
      seguimiento = 'No',
      cupon = 'FALSE',
      notas = '',
    } = body

    if (!nombre || !producto || !fechaCompra) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // La fila a insertar no incluye ID, que se puede generar automáticamente en la hoja
    const fila = [
      '', // Dejar vacía la columna ID para que Google Sheets la maneje o se agregue al final
      nombre,
      telefono || '',
      fechaCompra,
      producto,
      sabor || '',
      precio ? precio.toString() : '',
      pagado || 'No',
      entregado || 'No',
      seguimiento || 'No',
      cupon || 'FALSE',
      notas || '',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [fila] },
    })

    // Devuelve lista actualizada tras agregar
    const getRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A2:L` })
    const rows = getRes.data.values || []
    const clients = rows.map((row, i) => ({
      clienteId: parseInt(row[0]) || i + 2,
      nombre: row[1] || '',
      telefono: row[2] || '',
      fechaCompra: row[3] || '',
      producto: row[4] || '',
      sabor: row[5] || '',
      precio: parseFloat(row[6]) || 0,
      pagado: row[7] || 'No',
      entregado: row[8] || 'No',
      seguimiento: row[9] || 'No',
      cupon: row[10] || 'FALSE',
      notas: row[11] || '',
    }))

    return NextResponse.json(clients)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error en servidor' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { clienteId, ...data } = body

    if (!clienteId) {
      return NextResponse.json({ error: 'Falta clienteId para actualizar' }, { status: 400 })
    }

    const normalizeRow = (row: string[]) => {
      const filled = [...row]
      while (filled.length < 12) filled.push('')
      return filled.slice(0, 12)
    }

    const fila = [
      clienteId.toString(), // Asegurarse de mantener el ID en columna A
      data.nombre,
      data.telefono || '',
      data.fechaCompra,
      data.producto,
      data.sabor || '',
      data.precio ? data.precio.toString() : '',
      data.pagado || 'No',
      data.entregado || 'No',
      data.seguimiento || 'No',
      data.cupon || 'FALSE',
      data.notas || '',
    ]

    const range = `${sheetName}!A${clienteId}:L${clienteId}`

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [fila] },
    })

    // Devuelve lista actualizada tras modificar
    const getRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!A2:L` })
    const rows = getRes.data.values || []
    const clients = rows.map((row, i) => {
      const r = normalizeRow(row)
      return {
        clienteId: parseInt(r[0]) || i + 2,
        nombre: r[1],
        telefono: r[2],
        fechaCompra: r[3],
        producto: r[4],
        sabor: r[5],
        precio: parseFloat(r[6]) || 0,
        pagado: r[7],
        entregado: r[8],
        seguimiento: r[9],
        cupon: r[10],
        notas: r[11],
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error en servidor' }, { status: 500 })
  }
}
