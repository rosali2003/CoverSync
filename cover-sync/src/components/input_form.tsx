'use client'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ResumeUploader } from "@/components/upload_resume"

export const CoverLetterGenerator = () => {
  const [formData, setFormData] = useState({
    company_applying_for: '',
    resumeText: '',
    // email: '',
    // phone: '',
    // company: '',
    // position: '',
    // skills: '',
    // experience: ''
  })

  const [generatedLetter, setGeneratedLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value
    }
    console.log('name', name)
    console.log('value', value)
    setFormData(newFormData)
    console.log('formData', newFormData)
  }

  const handleResumeProcessed = (text: string) => {
    setFormData(prev => ({
      ...prev,
      resumeText: text
    }))
    console.log('formData', formData)
  }

  const generateLetter = async () => {
    setIsGenerating(true)
    setGeneratedLetter('')

    // Add validation
    if (!formData.company_applying_for || !formData.resumeText) {
      setGeneratedLetter('Please fill in both the company name and upload a resume.')
      setIsGenerating(false)
      return
    }

    try {
      // Log the exact payload being sent
      const payload = {
        company_applying_for: formData.company_applying_for.trim(),
        resumeText: formData.resumeText.trim()
      }
      console.log('Sending payload:', payload)

      const response = await fetch("/api/generate_cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('cover letter data', data.body)
      setGeneratedLetter(data.body);
    } catch (error) {
      setGeneratedLetter(`Error: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Cover Letter Generator</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Fill in your details to generate a cover letter</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <Input
                 placeholder="Company applying for"
                 name="company_applying_for"
                 value={formData.company_applying_for}
                 onChange={handleInputChange}
               />
               <ResumeUploader onResumeProcessed={handleResumeProcessed} />
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={generateLetter}
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Cover Letter</CardTitle>
            <CardDescription>Your customized cover letter will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap min-h-[300px]">
              {generatedLetter}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// #fields
// - question being asked
// - type of role applying for
// - priority of the company/role to you
// - skills/experience you want to highlight
