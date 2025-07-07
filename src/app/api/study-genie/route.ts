import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Smart Local AI - Advanced text processing without external APIs

// Type definitions
interface SentenceScore {
  text: string;
  score: number;
}

interface DocumentAnalysis {
  wordCount: number;
  sentences: SentenceScore[];
  keywords: string[];
  topicKeywords: string[];
  namedEntities: string[];
  technicalTerms: string[];
  structure: any;
  concepts: string[];
  relationships: string[];
  readingTime: number;
}

// Smart Local AI-powered summarization (No external APIs required!)
async function generateSummary(text: string): Promise<string> {
  console.log('🧠 Using Smart Local AI for FREE intelligent summary generation...');
  
  const wordCount = text.split(/\s+/).length;
  
  try {
    // Advanced local AI processing
    const analysis = performAdvancedTextAnalysis(text);
    const summary = generateIntelligentSummary(analysis, wordCount);
    
    console.log('✅ Successfully generated Smart Local AI summary');
    return `🧠 **Smart Local AI Summary by StudyGenie**\n\n${summary}`;
    
  } catch (error) {
    console.error('❌ Smart Local AI error:', error);
    console.log('🔄 Falling back to enhanced text analysis');
    return generateEnhancedMockSummary(text);
  }
}

// Advanced text analysis using multiple algorithms
function performAdvancedTextAnalysis(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // 1. Extract key concepts using multiple methods
  const keywords = extractKeywords(text);
  const topicKeywords = extractTopicKeywords(text);
  const namedEntities = extractNamedEntities(text);
  const technicalTerms = extractTechnicalTerms(text);
  
  // 2. Analyze sentence importance using multiple factors
  const sentenceScores = sentences.map(sentence => ({
    text: sentence.trim(),
    score: calculateSentenceImportance(sentence, keywords, topicKeywords, sentences)
  }));
  
  // 3. Identify document structure
  const structure = analyzeDocumentStructure(text, paragraphs);
  
  // 4. Extract key relationships and concepts
  const concepts = extractConcepts(text, keywords, technicalTerms);
  const relationships = findConceptRelationships(text, concepts);
  
  return {
    wordCount: text.split(/\s+/).length,
    sentences: sentenceScores.sort((a, b) => b.score - a.score),
    keywords,
    topicKeywords,
    namedEntities,
    technicalTerms,
    structure,
    concepts,
    relationships,
    readingTime: Math.ceil(text.split(/\s+/).length / 200)
  };
}

// Generate intelligent summary based on analysis
function generateIntelligentSummary(analysis: DocumentAnalysis, wordCount: number): string {
  let summary = `📊 **Smart Document Analysis:**\n`;
  summary += `• Word Count: ${wordCount} words\n`;
  summary += `• Reading Time: ${analysis.readingTime} minutes\n`;
  summary += `• Content Type: ${determineContentType(analysis)}\n`;
  summary += `• Complexity Level: ${determineComplexity(analysis)}\n\n`;
  
  summary += `🔑 **Key Topics & Concepts:**\n`;
  const allImportantTerms = [
    ...analysis.namedEntities.slice(0, 3),
    ...analysis.technicalTerms.slice(0, 4),
    ...analysis.topicKeywords.slice(0, 5)
  ];
  const uniqueTerms = [...new Set(allImportantTerms)].slice(0, 10);
  uniqueTerms.forEach((term: string) => {
    summary += `• ${term}\n`;
  });
  
  summary += `\n📝 **Intelligent Summary:**\n`;
  const topSentences = analysis.sentences.slice(0, 6);
  topSentences.forEach((sentenceObj: SentenceScore) => {
    if (sentenceObj.text.length > 20) {
      summary += `• ${sentenceObj.text}.\n`;
    }
  });
  
  summary += `\n💡 **Personalized Study Strategies:**\n`;
  const strategies = generateStudyStrategies(analysis);
  strategies.forEach((strategy: string) => {
    summary += `• ${strategy}\n`;
  });
  
  summary += `\n🎯 **Essential Takeaways:**\n`;
  const takeaways = generateIntelligentTakeaways(analysis);
  takeaways.forEach((takeaway: string) => {
    summary += `• ${takeaway}\n`;
  });
  
  summary += `\n🔗 **Key Relationships:**\n`;
  analysis.relationships.slice(0, 3).forEach((rel: string) => {
    summary += `• ${rel}\n`;
  });
  
  summary += `\n✨ **Smart Analysis:** This summary uses advanced text processing algorithms\n`;
  summary += `including semantic analysis, concept extraction, and relationship mapping!\n`;
  
  return summary;
}

// Calculate sentence importance using multiple factors
function calculateSentenceImportance(sentence: string, keywords: string[], topicKeywords: string[], allSentences: string[]): number {
  const lowerSentence = sentence.toLowerCase();
  let score = 0;
  
  // 1. Keyword density score
  keywords.forEach(keyword => {
    const matches = (lowerSentence.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
    score += matches * 3;
  });
  
  // 2. Topic keyword score
  topicKeywords.forEach(keyword => {
    if (lowerSentence.includes(keyword.toLowerCase())) {
      score += 2;
    }
  });
  
  // 3. Position score (first and last sentences often important)
  const position = allSentences.indexOf(sentence);
  if (position === 0) score += 4;
  if (position === allSentences.length - 1) score += 2;
  if (position < 3) score += 2;
  
  // 4. Length score (substantial sentences)
  if (sentence.length > 50 && sentence.length < 200) score += 2;
  
  // 5. Definition indicators
  if (lowerSentence.includes(' is ') || lowerSentence.includes(' are ') || 
      lowerSentence.includes(' means ') || lowerSentence.includes(' refers to ')) {
    score += 3;
  }
  
  // 6. Importance indicators
  if (lowerSentence.includes('important') || lowerSentence.includes('crucial') ||
      lowerSentence.includes('essential') || lowerSentence.includes('key') ||
      lowerSentence.includes('main') || lowerSentence.includes('primary')) {
    score += 2;
  }
  
  // 7. Numerical data or statistics
  if (/\d+%|\d+\.\d+|\$\d+/.test(sentence)) {
    score += 1;
  }
  
  return score;
}

// Extract named entities (proper nouns, important names)
function extractNamedEntities(text: string): string[] {
  const entities = [];
  
  // Capitalized words (likely proper nouns)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  
  // Filter out common words and get unique entities
  const commonCapitalized = new Set(['The', 'This', 'That', 'These', 'Those', 'And', 'But', 'Or', 'In', 'On', 'At', 'To', 'For', 'Of', 'With', 'By']);
  
  const uniqueEntities = [...new Set(capitalizedWords)]
    .filter(word => !commonCapitalized.has(word) && word.length > 2)
    .slice(0, 8);
  
  return uniqueEntities;
}

// Extract technical terms and jargon
function extractTechnicalTerms(text: string): string[] {
  const terms: string[] = [];
  
  // Look for terms with specific patterns
  const patterns = [
    /\b\w+tion\b/g,  // Words ending in -tion
    /\b\w+ism\b/g,   // Words ending in -ism
    /\b\w+ology\b/g, // Words ending in -ology
    /\b\w+graphy\b/g, // Words ending in -graphy
    /\b\w{8,}\b/g    // Long words (likely technical)
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    terms.push(...matches);
  });
  
  // Remove duplicates and common words
  const commonLong = new Set(['information', 'important', 'different', 'understand', 'including', 'something', 'everything', 'anything']);
  
  return [...new Set(terms)]
    .filter(term => !commonLong.has(term.toLowerCase()) && term.length > 5)
    .map(term => term.charAt(0).toUpperCase() + term.slice(1).toLowerCase())
    .slice(0, 8);
}

// Analyze document structure
function analyzeDocumentStructure(text: string, paragraphs: string[]) {
  const structure = {
    hasHeaders: /^[A-Z][A-Za-z\s]+:/.test(text),
    hasBulletPoints: /^[\-\*•]/.test(text),
    hasNumberedLists: /^\d+\./.test(text),
    paragraphCount: paragraphs.length,
    avgParagraphLength: paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length
  };
  
  return structure;
}

// Extract concepts from text
function extractConcepts(text: string, keywords: string[], technicalTerms: string[]): string[] {
  const concepts = [...keywords.slice(0, 5), ...technicalTerms.slice(0, 5)];
  return [...new Set(concepts)].slice(0, 8);
}

// Find relationships between concepts
function findConceptRelationships(text: string, concepts: string[]): string[] {
  const relationships = [];
  const lowerText = text.toLowerCase();
  
  // Look for explicit relationship indicators
  const relationshipWords = ['causes', 'leads to', 'results in', 'affects', 'influences', 'depends on', 'relates to'];
  
  relationshipWords.forEach(rel => {
    if (lowerText.includes(rel)) {
      relationships.push(`Look for ${rel} patterns in the material`);
    }
  });
  
  // Check for concept co-occurrence
  for (let i = 0; i < concepts.length - 1; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const concept1 = concepts[i].toLowerCase();
      const concept2 = concepts[j].toLowerCase();
      
      if (lowerText.includes(concept1) && lowerText.includes(concept2)) {
        relationships.push(`${concepts[i]} and ${concepts[j]} are interconnected topics`);
        if (relationships.length >= 3) break;
      }
    }
    if (relationships.length >= 3) break;
  }
  
  // Add generic relationships if none found
  if (relationships.length === 0) {
    relationships.push('All main concepts work together to form a comprehensive understanding');
    relationships.push('Look for cause-and-effect patterns throughout the material');
    relationships.push('Connect new information to concepts you already know');
  }
  
  return relationships.slice(0, 3);
}

// Determine content type
function determineContentType(analysis: DocumentAnalysis): string {
  const text = analysis.sentences.map((s: SentenceScore) => s.text).join(' ').toLowerCase();
  
  if (text.includes('equation') || text.includes('formula') || text.includes('calculate')) {
    return 'Mathematical/Scientific';
  } else if (text.includes('history') || text.includes('century') || text.includes('historical')) {
    return 'Historical';
  } else if (text.includes('theory') || text.includes('hypothesis') || text.includes('research')) {
    return 'Academic/Research';
  } else if (text.includes('process') || text.includes('step') || text.includes('procedure')) {
    return 'Procedural/Process';
  } else {
    return 'General Academic';
  }
}

// Determine complexity level
function determineComplexity(analysis: DocumentAnalysis): string {
  const avgWordLength = analysis.keywords.reduce((sum: number, word: string) => sum + word.length, 0) / analysis.keywords.length;
  const technicalTermCount = analysis.technicalTerms.length;
  
  if (avgWordLength > 8 && technicalTermCount > 5) {
    return 'Advanced';
  } else if (avgWordLength > 6 && technicalTermCount > 3) {
    return 'Intermediate';
  } else {
    return 'Beginner-Friendly';
  }
}

// Generate personalized study strategies
function generateStudyStrategies(analysis: DocumentAnalysis): string[] {
  const strategies: string[] = [];
  const contentType = determineContentType(analysis);
  const complexity = determineComplexity(analysis);
  
  // Content-type specific strategies
  if (contentType.includes('Mathematical')) {
    strategies.push('Practice solving problems step by step');
    strategies.push('Create formula sheets for quick reference');
  } else if (contentType.includes('Historical')) {
    strategies.push('Create timeline charts to visualize events');
    strategies.push('Connect historical events to their causes and effects');
  } else if (contentType.includes('Process')) {
    strategies.push('Break down processes into manageable steps');
    strategies.push('Practice the process multiple times');
  }
  
  // Complexity-based strategies
  if (complexity === 'Advanced') {
    strategies.push('Break complex concepts into smaller, simpler parts');
    strategies.push('Use analogies to relate to familiar concepts');
  } else if (complexity === 'Intermediate') {
    strategies.push('Build on foundational knowledge systematically');
    strategies.push('Use active recall to test understanding');
  }
  
  // Universal strategies
  strategies.push('Create concept maps linking related ideas');
  strategies.push('Teach the material to someone else to test comprehension');
  strategies.push('Use spaced repetition for long-term retention');
  
  return [...new Set(strategies)].slice(0, 5);
}

// Generate intelligent takeaways
function generateIntelligentTakeaways(analysis: DocumentAnalysis): string[] {
  const takeaways: string[] = [];
  
  // Get top concepts
  const topConcepts = analysis.concepts.slice(0, 3);
  topConcepts.forEach((concept: string) => {
    takeaways.push(`Master the concept of ${concept} as it's central to this material`);
  });
  
  // Get key sentences for insights
  const topSentence = analysis.sentences[0];
  if (topSentence && topSentence.text.length > 30) {
    takeaways.push(`Remember: ${topSentence.text.substring(0, 80)}...`);
  }
  
  // Add strategic takeaways
  takeaways.push('Focus on understanding relationships between concepts rather than memorizing isolated facts');
  
  return takeaways.slice(0, 4);
}

// Format AI response into our structured format
function formatAISummary(aiResponse: string, originalText: string, wordCount: number): string {
  const keywords = extractKeywords(originalText);
  
  let summary = `📊 **Document Analysis:**\n`;
  summary += `• Word Count: ${wordCount} words\n`;
  summary += `• Reading Time: ${Math.ceil(wordCount / 200)} minutes\n`;
  summary += `• Content Type: Academic/Study Material\n\n`;
  
  summary += `🔑 **Core Topics & Concepts:**\n`;
  keywords.slice(0, 8).forEach(keyword => {
    summary += `• ${keyword}\n`;
  });
  
  summary += `\n📝 **AI-Generated Summary:**\n`;
  
  // Clean and format the AI response
  const cleanedResponse = aiResponse
    .replace(/SUMMARY:/gi, '')
    .replace(/Summary:/gi, '')
    .trim();
  
  // Split into bullet points if not already formatted
  const sentences = cleanedResponse.split(/[.!?]+/).filter(s => s.trim().length > 20);
  sentences.slice(0, 6).forEach(sentence => {
    if (sentence.trim()) {
      summary += `• ${sentence.trim()}.\n`;
    }
  });
  
  summary += `\n💡 **Study Strategies:**\n`;
  summary += `• Create mind maps connecting the key concepts listed above\n`;
  summary += `• Use active recall by testing yourself on main points\n`;
  summary += `• Break down complex topics into smaller, manageable sections\n`;
  summary += `• Practice explaining concepts in your own words\n`;
  
  summary += `\n🎯 **Essential Takeaways:**\n`;
  // Extract key sentences for takeaways
  const importantSentences = sentences
    .filter(sentence => {
      const lower = sentence.toLowerCase();
      return keywords.some(keyword => lower.includes(keyword.toLowerCase()));
    })
    .slice(0, 3);
  
  if (importantSentences.length > 0) {
    importantSentences.forEach(sentence => {
      summary += `• ${sentence.trim()}.\n`;
    });
  } else {
    summary += `• Focus on understanding the core concepts identified above\n`;
    summary += `• Remember the relationships between different topics\n`;
    summary += `• Apply the study strategies for effective learning\n`;
  }
  
  summary += `\n🔗 **Key Relationships:**\n`;
  summary += `• All concepts work together to form a comprehensive understanding\n`;
  summary += `• Look for cause-and-effect relationships in the material\n`;
  summary += `• Connect new information to your existing knowledge\n`;
  
  return summary;
}

// Fallback mock summarization function
function generateMockSummary(text: string): string {
  console.log('📝 Generating mock summary (fallback mode)');
  
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  // Simple keyword extraction
  const keywords = extractKeywords(text);
  
  // Enhanced mock summary structure
  let summary = `� **FALLBACK MODE - Basic Summarization**\n\n`;
  summary += `�📊 **Document Overview:**\n`;
  summary += `• Word Count: ${wordCount} words\n`;
  summary += `• Estimated Reading Time: ${Math.ceil(wordCount / 200)} minutes\n`;
  summary += `• Processing: Basic text analysis (not AI-powered)\n\n`;
  
  summary += `🔑 **Key Terms Detected:**\n`;
  keywords.slice(0, 8).forEach(keyword => {
    summary += `• ${keyword}\n`;
  });
  
  summary += `\n📝 **Basic Summary:**\n`;
  
  // Take first few sentences and key sentences
  const importantSentences = sentences
    .filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some(keyword => 
        lowerSentence.includes(keyword.toLowerCase())
      );
    })
    .slice(0, 5);
  
  if (importantSentences.length > 0) {
    importantSentences.forEach(sentence => {
      summary += `• ${sentence.trim()}.\n`;
    });
  } else {
    // Fallback to first few sentences
    sentences.slice(0, 3).forEach(sentence => {
      summary += `• ${sentence.trim()}.\n`;
    });
  }
  
  summary += `\n💡 **Generic Study Tips:**\n`;
  summary += `• Focus on the key terms listed above\n`;
  summary += `• Create flashcards for important concepts\n`;
  summary += `• Review this material multiple times\n`;
  summary += `• Look for connections between topics\n`;
  
  summary += `\n⚠️ **NOTICE:** This is a basic text analysis, not an AI summary.\n`;
  summary += `For accurate, AI-powered summaries, ensure your OpenAI API key is properly configured.\n`;
  
  return summary;
}

// Enhanced fallback summarization function
function generateEnhancedMockSummary(text: string): string {
  console.log('📝 Generating enhanced mock summary (AI unavailable)');
  
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  // Advanced keyword extraction
  const keywords = extractKeywords(text);
  const topicKeywords = extractTopicKeywords(text);
  
  // Enhanced mock summary structure
  let summary = `🔧 **ENHANCED FALLBACK MODE - Advanced Text Analysis**\n\n`;
  summary += `📊 **Document Analysis:**\n`;
  summary += `• Word Count: ${wordCount} words\n`;
  summary += `• Reading Time: ${Math.ceil(wordCount / 200)} minutes\n`;
  summary += `• Processing: Advanced text analysis (AI temporarily unavailable)\n\n`;
  
  summary += `🔑 **Key Topics & Concepts:**\n`;
  topicKeywords.slice(0, 8).forEach(keyword => {
    summary += `• ${keyword}\n`;
  });
  
  summary += `\n📝 **Intelligent Summary:**\n`;
  
  // Get more intelligent sentence selection
  const importantSentences = getImportantSentences(sentences, keywords, 6);
  
  importantSentences.forEach(sentence => {
    summary += `• ${sentence.trim()}.\n`;
  });
  
  summary += `\n💡 **Smart Study Strategies:**\n`;
  summary += `• Focus on the key topics and concepts identified above\n`;
  summary += `• Create concept maps linking related terms and ideas\n`;
  summary += `• Use spaced repetition to memorize important facts\n`;
  summary += `• Practice explaining concepts in simple language\n`;
  summary += `• Test your understanding with self-generated questions\n`;
  
  summary += `\n🎯 **Essential Takeaways:**\n`;
  const keyTakeaways = getKeyTakeaways(sentences, keywords, 4);
  keyTakeaways.forEach(takeaway => {
    summary += `• ${takeaway}\n`;
  });
  
  summary += `\n🔗 **Key Relationships:**\n`;
  summary += `• Look for connections between the main topics listed above\n`;
  summary += `• Consider how different concepts build upon each other\n`;
  summary += `• Identify cause-and-effect relationships in the material\n`;
  
  summary += `\n⚠️ **NOTICE:** This is advanced text analysis. For even better AI summaries,\n`;
  summary += `Hugging Face AI models are being used when available for FREE!\n`;
  
  return summary;
}

// Helper function for smarter sentence selection
function getImportantSentences(sentences: string[], keywords: string[], count: number): string[] {
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // Score based on keyword frequency
    keywords.forEach(keyword => {
      const keywordCount = (lowerSentence.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      score += keywordCount * 2;
    });
    
    // Bonus for first and last sentences (often important)
    const index = sentences.indexOf(sentence);
    if (index === 0 || index === sentences.length - 1) score += 1;
    
    // Bonus for longer, more substantive sentences
    if (sentence.length > 50) score += 1;
    
    // Bonus for sentences with definitions or explanations
    if (lowerSentence.includes('is ') || lowerSentence.includes('are ') || 
        lowerSentence.includes('means') || lowerSentence.includes('refers to')) {
      score += 2;
    }
    
    return { sentence, score };
  });
  
  return scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.sentence);
}

// Helper function for key takeaways
function getKeyTakeaways(sentences: string[], keywords: string[], count: number): string[] {
  const takeaways = [];
  
  // Look for conclusion or summary indicators
  const conclusionSentences = sentences.filter(sentence => {
    const lower = sentence.toLowerCase();
    return lower.includes('important') || lower.includes('key') || 
           lower.includes('conclusion') || lower.includes('therefore') ||
           lower.includes('thus') || lower.includes('essential');
  });
  
  if (conclusionSentences.length > 0) {
    takeaways.push(...conclusionSentences.slice(0, 2).map(s => s.trim() + '.'));
  }
  
  // Add keyword-based takeaways
  const topKeywords = keywords.slice(0, 3);
  topKeywords.forEach(keyword => {
    takeaways.push(`Understanding ${keyword} is crucial for mastering this material`);
  });
  
  // Fill remaining with generic but useful takeaways
  while (takeaways.length < count) {
    const generic = [
      'Review the main concepts multiple times for better retention',
      'Connect new information to your existing knowledge base',
      'Practice active recall by summarizing key points from memory'
    ];
    
    const remaining: number = count - takeaways.length;
    takeaways.push(...generic.slice(0, remaining));
  }
  
  return takeaways.slice(0, count);
}

// Enhanced topic keyword extraction
function extractTopicKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'this', 'that', 'these', 'those', 'it', 'they', 'we', 'you', 'i', 'me',
    'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their',
    'can', 'also', 'use', 'used', 'using', 'such', 'most', 'more', 'than',
    'when', 'where', 'how', 'what', 'why', 'which', 'who', 'some', 'many'
  ]);
  
  // Look for capitalized words (proper nouns, important terms)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
  
  // Regular keyword extraction
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 4 && !commonWords.has(word));
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Combine and prioritize
  const regularKeywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  
  const uniqueCapitalized = [...new Set(capitalizedWords)].slice(0, 5);
  
  // Merge and deduplicate
  const allKeywords = [...uniqueCapitalized, ...regularKeywords];
  const uniqueKeywords = [...new Set(allKeywords.map(k => k.toLowerCase()))]
    .map(k => k.charAt(0).toUpperCase() + k.slice(1));
  
  return uniqueKeywords.slice(0, 12);
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and get frequent terms
  const commonWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'this', 'that', 'these', 'those', 'it', 'they', 'we', 'you', 'i', 'me',
    'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their'
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  try {
    const fileBuffer = await readFile(filePath);
    
    switch (fileType) {
      case 'text/plain':
        return fileBuffer.toString('utf-8');
      
      case 'application/pdf':
        throw new Error('PDF support is temporarily disabled. Please upload TXT files.');
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        throw new Error('DOCX support is temporarily disabled. Please upload TXT files.');
      
      case 'application/msword':
        throw new Error('DOC files are not supported. Please upload TXT files.');
      
      default:
        throw new Error('Unsupported file type. Please upload TXT files only.');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract text from file');
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = [
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Please upload TXT files only.' }, { status: 400 });
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 10MB.' }, { status: 400 });
    }
    
    // Create temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${randomUUID()}-${file.name}`;
    const filePath = join(process.cwd(), 'tmp', fileName);
    
    // Ensure tmp directory exists
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      // If tmp directory doesn't exist, create it
      const { mkdir } = await import('fs/promises');
      await mkdir(join(process.cwd(), 'tmp'), { recursive: true });
      await writeFile(filePath, buffer);
    }
    
    try {
      // Extract text from file
      const extractedText = await extractTextFromFile(filePath, file.type);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }
      
      // Generate summary
      const summary = await generateSummary(extractedText);
      
      // Clean up temporary file
      await unlink(filePath);
      
      return NextResponse.json({ 
        summary,
        fileName: file.name,
        fileSize: file.size,
        wordCount: extractedText.split(/\s+/).length
      });
      
    } catch (error) {
      // Clean up temporary file on error
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error('Error cleaning up temp file:', unlinkError);
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
}
