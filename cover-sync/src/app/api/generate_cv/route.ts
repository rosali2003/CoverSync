import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchPageContent } from "../crawl/parse_page/route";
import { crawlPage } from "../crawl/crawler/route";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

function ensureValidUrl(urlString: string): string {
  if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
    return `https://${urlString}`;
  }
  return urlString;
}

interface PageContents {
  [key: string]: string;
}

async function analyzeContent(content: string) {
  try {
    const prompt = `You are a professional career advisor. Analyze this company page content and extract key information for a cover letter.

    Analyze this content and extract:
    1) Company values and culture
    2) Key requirements and qualifications
    3) Responsibilities and expectations

    Content: ${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Gemini response:", response.text());
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

async function generateCoverLetter(companyInfo: string, jobInfo: string, candidateInfo: string) {
  try {
    const prompt = `You are a professional cover letter writer. Create a compelling cover letter based on this information:

    Company Information: ${companyInfo}
    Job Information: ${jobInfo}
    Candidate Information: ${candidateInfo}
    Format the cover letter professionally with proper spacing and paragraphs.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Generated cover letter:", response.text());
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return null;
  }
}

const foundPaths = async (baseUrl: URL) => {
  try {
    console.log("crawling in generate cv base url", baseUrl);
    const paths = await crawlPage(baseUrl.toString(), baseUrl.toString());
    return (
      paths.filter((path: string) => {
        const lowercasePath = path.toLowerCase();
        return (
          lowercasePath.includes("career") ||
          lowercasePath.includes("jobs") ||
          lowercasePath.includes("positions") ||
          lowercasePath.includes("opportunities") ||
          lowercasePath.includes("about")
          // lowercasePath.includes("blog")
        );
      }) ?? []
    );
  } catch (error) {
    console.error("Error crawling page:", error);
  }
};

export async function POST(request: Request) {
  try {
    if (!request.body) {
      return NextResponse.json(
        {
          success: false,
          error: "No request body provided",
        },
        { status: 400 }
      );
    }

    const { company_applying_for, resumeText } = await request.json();
    console.log("resume text", resumeText);
    console.log("url", company_applying_for);
    const url = new URL(company_applying_for);
    const paths = await foundPaths(url);
    let pageContents: PageContents = {};

    if (paths) {
      for (const path of paths) {
        const fullUrl = new URL(path, company_applying_for).toString();
        const content = await fetchPageContent(fullUrl);
        if (content) {
          pageContents[path] = content;
        }
      }
    }
    console.log('paths', paths)
    const aboutPath = paths?.find((path) =>
      path.toLowerCase().includes("about")
    );
    const careersPath = paths?.find((path) =>
      path.toLowerCase().includes("career")
    );

    const aboutAnalysis = aboutPath
      ? await analyzeContent(pageContents[aboutPath])
      : null;
    const careersAnalysis = careersPath
      ? await analyzeContent(pageContents[careersPath])
      : null;

    const candidateAnalysis = await analyzeContent(resumeText);

    let coverLetter = null;
    console.log("generating cover letter");
    console.log("about analysis", aboutAnalysis);
    console.log("careers analysis", careersAnalysis);
    if (aboutAnalysis && careersAnalysis) {
      console.log("about analysis", aboutAnalysis);
      coverLetter = await generateCoverLetter(
        aboutAnalysis,
        careersAnalysis,
        candidateAnalysis ?? ""
      );
      console.log("cover letter", coverLetter);
    }

    return NextResponse.json({
      success: true,
      analysis: {
        about: aboutAnalysis,
        careers: careersAnalysis,
        candidate: candidateAnalysis,
      },
      body: coverLetter,
    });
  } catch (error) {
    console.log("error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate cover letter",
      },
      { status: 500 }
    );
  }
}
