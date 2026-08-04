import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contracts, applications, tasks, enterpriseProfiles, studentProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { renderToStream } from '@react-pdf/renderer'
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define PDF styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  text: { fontSize: 12, marginBottom: 5, lineHeight: 1.5 },
  signatureBlock: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  signatureLine: { borderTop: '1px solid black', width: 200, marginTop: 40, paddingTop: 10 },
  statusSigned: { color: 'green', fontSize: 10 },
  statusPending: { color: 'red', fontSize: 10 },
})

const ContractPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Service Agreement Contract</Text>
      
      <View style={styles.section}>
        <Text style={styles.title}>1. The Parties</Text>
        <Text style={styles.text}>This Agreement is entered into by and between:</Text>
        <Text style={styles.text}>Enterprise: {data.enterpriseName}</Text>
        <Text style={styles.text}>Contractor (Student): {data.studentName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>2. The Task</Text>
        <Text style={styles.text}>Task Title: {data.taskTitle}</Text>
        <Text style={styles.text}>Description: {data.taskDescription}</Text>
        <Text style={styles.text}>Agreed Budget: ${data.budget}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>3. Terms</Text>
        <Text style={styles.text}>The Contractor agrees to perform the services described above. The Enterprise agrees to pay the Agreed Budget upon satisfactory completion of the milestones.</Text>
      </View>

      <View style={styles.signatureBlock}>
        <View>
          <Text style={styles.text}>Enterprise Signature:</Text>
          <View style={styles.signatureLine}>
            <Text style={data.signedEnterprise ? styles.statusSigned : styles.statusPending}>
              {data.signedEnterprise ? 'ELECTRONICALLY SIGNED' : 'PENDING SIGNATURE'}
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.text}>Student Signature:</Text>
          <View style={styles.signatureLine}>
            <Text style={data.signedStudent ? styles.statusSigned : styles.statusPending}>
              {data.signedStudent ? 'ELECTRONICALLY SIGNED' : 'PENDING SIGNATURE'}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)

export async function GET(request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  const params = await context.params
  const contractId = params.id

  // Fetch full contract context
  const contractData = await db.select({
    contractId: contracts.id,
    signedEnterprise: contracts.signedByEnterprise,
    signedStudent: contracts.signedByStudent,
    taskTitle: tasks.title,
    taskDescription: tasks.description,
    budget: tasks.budget,
    enterpriseName: enterpriseProfiles.companyName,
    studentFirstName: studentProfiles.firstName,
    studentLastName: studentProfiles.lastName,
  })
  .from(contracts)
  .innerJoin(applications, eq(contracts.applicationId, applications.id))
  .innerJoin(tasks, eq(applications.taskId, tasks.id))
  .innerJoin(enterpriseProfiles, eq(tasks.enterpriseId, enterpriseProfiles.id))
  .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.id))
  .where(eq(contracts.id, contractId))
  .limit(1)

  if (!contractData || contractData.length === 0) {
    return new NextResponse('Contract not found', { status: 404 })
  }

  const c = contractData[0]
  const renderData = {
    enterpriseName: c.enterpriseName || 'Unknown Enterprise',
    studentName: `${c.studentFirstName} ${c.studentLastName}`,
    taskTitle: c.taskTitle,
    taskDescription: c.taskDescription,
    budget: c.budget,
    signedEnterprise: c.signedEnterprise,
    signedStudent: c.signedStudent,
  }

  try {
    const stream = await renderToStream(<ContractPDF data={renderData} />)
    
    // Convert stream to readable web stream
    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="contract-${contractId}.pdf"`,
      }
    })
  } catch (err) {
    console.error('PDF Generation Error:', err)
    return new NextResponse('Failed to generate PDF', { status: 500 })
  }
}
