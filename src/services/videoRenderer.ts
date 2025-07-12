import { VideoCustomization } from '../types';

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private customization: VideoCustomization | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  async renderVideo(
    text: string,
    title: string,
    customization: VideoCustomization,
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    // Store customization for use in other methods
    this.customization = customization;
    
    const { 
      aspectRatio, 
      backgroundColor, 
      textColor, 
      fontSize, 
      fontFamily, 
      speed, 
      textAnimation, 
      language, 
      backgroundImage, 
      startingImage, 
      outroImage,
      startingDuration = 5,
      outroDuration = 5
    } = customization;
    
    // Set canvas dimensions based on aspect ratio
    if (aspectRatio === '9:16') {
      this.canvas.width = 720;
      this.canvas.height = 1280;
    } else {
      this.canvas.width = 1280;
      this.canvas.height = 720;
    }

    // Generate clean title based on language
    const cleanTitle = this.generateCleanTitle(title, language);
    
    // Get outro text based on language
    const outroText = this.getOutroText(language);
    
    // Load images if provided
    let bgImg: HTMLImageElement | null = null;
    let startImg: HTMLImageElement | null = null;
    let outroImg: HTMLImageElement | null = null;
    
    if (backgroundImage) {
      bgImg = await this.loadImage(backgroundImage);
    }
    if (startingImage) {
      startImg = await this.loadImage(startingImage);
    }
    if (outroImage) {
      outroImg = await this.loadImage(outroImage);
    }
    
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Setup title font (larger and bolder than content)
    const titleFontSize = Math.min(fontSize * 1.5, fontSize + 40);
    const titleFont = `900 ${titleFontSize}px ${fontFamily}`;
    const contentFont = `bold ${fontSize}px ${fontFamily}`;

    // Calculate text metrics
    this.ctx.font = contentFont;
    this.ctx.fillStyle = textColor; // Set text color explicitly
    const words = text.split(' ');
    const lines = this.wrapText(words, this.canvas.width - 120); // More padding for larger text
    const lineHeight = fontSize * 1.6; // Better line spacing for larger text
    const totalHeight = lines.length * lineHeight;
    
    // Calculate title metrics
    this.ctx.font = titleFont;
    const titleLines = this.wrapText(cleanTitle.split(' '), this.canvas.width - 80);
    const titleLineHeight = titleFontSize * 1.4;
    
    // Calculate outro metrics
    const outroFontSize = Math.min(fontSize * 1.2, fontSize + 20);
    const outroFont = `600 ${outroFontSize}px ${fontFamily}`;
    this.ctx.font = outroFont;
    const outroLines = this.wrapText(outroText.split(' '), this.canvas.width - 100);
    const outroLineHeight = outroFontSize * 1.5;
    
    // Animation parameters
    const fps = 30;
    
    // Calculate durations based on whether images are present
    let titleDuration = 0;
    let finalOutroDuration = 0;
    
    // Always show title for a minimum duration, longer if there's a starting image
    titleDuration = startingImage && startImg ? startingDuration : 3; // 3 seconds minimum for title
    
    // Only show outro if there's an outro image
    if (outroImage && outroImg) {
      finalOutroDuration = outroDuration; // User-defined duration for outro
    }
    
    let contentDuration: number;
    
    if (textAnimation === 'scroll') {
      // For scroll: precise time for scrolling + minimal pause
      const wordCount = text.split(' ').length;
      const baseScrollTime = Math.max(12, (wordCount / 150) * 60); // Adjusted for better pacing
      contentDuration = (baseScrollTime + 1) / speed; // Only 1 second pause after scroll
    } else if (textAnimation === 'fade') {
      // For fade: precise time per screen
      const linesPerScreen = Math.floor((this.canvas.height * 0.8) / lineHeight);
      const totalScreens = Math.ceil(lines.length / linesPerScreen);
      const timePerScreen = Math.max(2.5, (text.split(' ').length / totalScreens / 180) * 60);
      contentDuration = (timePerScreen * totalScreens + 0.5) / speed; // Minimal pause
    } else { // typewriter
      // For typewriter: precise typing time + minimal pause
      const typingSpeed = 60 / speed; // Characters per second
      const typingTime = text.length / typingSpeed;
      contentDuration = typingTime + 1; // Only 1 second pause after typing
    }
    
    const totalFrames = fps * (titleDuration + contentDuration + finalOutroDuration);

    // Setup MediaRecorder
    const stream = this.canvas.captureStream(fps);
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    this.chunks = [];
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder!.onerror = (e) => {
        reject(e);
      };

      this.mediaRecorder!.start();

      // Render frames based on animation type
      let currentFrame = 0;
      
      const renderFrame = () => {
        if (currentFrame >= totalFrames) {
          this.mediaRecorder!.stop();
          return;
        }

        const progress = currentFrame / totalFrames;
        const titlePhase = (titleDuration * fps) / totalFrames;
        const outroPhase = (finalOutroDuration * fps) / totalFrames;
        const contentPhase = 1 - titlePhase - outroPhase;

        // Clear canvas
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = textColor;
        
        if (progress <= titlePhase) {
          // Show title (with or without intro image)
          this.renderTitle(titleLines, titleLineHeight, titleFont, progress / titlePhase, startImg, backgroundColor);
        } else if (progress <= titlePhase + contentPhase) {
          // Show main content animation
          const contentProgress = (progress - titlePhase) / contentPhase;
          
          // Draw background
          this.drawBackground(bgImg, backgroundColor);
          
          // Set font for content
          this.ctx.font = contentFont;
          
          if (textAnimation === 'scroll') {
            this.renderScrollAnimation(lines, lineHeight, contentProgress, totalHeight);
          } else if (textAnimation === 'fade') {
            this.renderFadeAnimation(lines, lineHeight, contentProgress);
          } else if (textAnimation === 'typewriter') {
            this.renderTypewriterAnimation(lines, lineHeight, contentProgress);
          }
        } else if (outroImg) {
          // Show outro (only if outro image exists)
          const outroProgress = (progress - titlePhase - contentPhase) / outroPhase;
          this.renderOutro(outroLines, outroLineHeight, outroFont, outroProgress, outroImg, backgroundColor);
        }

        // Update progress
        onProgress(Math.round((currentFrame / totalFrames) * 100));

        currentFrame++;
        setTimeout(renderFrame, 1000 / fps);
      };

      renderFrame();
    });
  }

  private async loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  private drawBackground(bgImg: HTMLImageElement | null, backgroundColor: string) {
    if (bgImg) {
      // Draw background image
      this.ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
      // Add overlay for better text readability
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private generateCleanTitle(originalTitle: string, language: string): string {
    // Clean up the title more carefully
    let cleanTitle = originalTitle.trim();
    
    // Remove excessive punctuation but keep basic ones
    cleanTitle = cleanTitle
      .replace(/[""''()[\]{}]/g, '') // Remove quotes and brackets
      .replace(/[.!?;:,]{2,}/g, '') // Remove multiple punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Remove common AI-generated prefixes
    const prefixes = [
      'Title:', 'title:', 'TITLE:',
      'Story:', 'story:', 'STORY:',
      'The Story of', 'A Story of', 'Story of',
      'The Tale of', 'A Tale of', 'Tale of'
    ];
    
    for (const prefix of prefixes) {
      if (cleanTitle.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleanTitle = cleanTitle.substring(prefix.length).trim();
        break;
      }
    }
    
    // Remove English version if title contains non-Latin characters (indicating other language)
    const hasNonLatin = /[^\u0000-\u007F]/.test(cleanTitle);
    if (hasNonLatin && language !== 'en') {
      // Split by common separators and keep only the non-English part
      const parts = cleanTitle.split(/[|\-–—:]/);
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (/[^\u0000-\u007F]/.test(trimmedPart)) {
          cleanTitle = trimmedPart;
          break;
        }
      }
    }
    
    // Limit title length for better display
    const words = cleanTitle.split(' ');
    if (words.length > 8) {
      cleanTitle = words.slice(0, 8).join(' ');
    }
    
    // If still too long by character count, truncate
    if (cleanTitle.length > 60) {
      cleanTitle = cleanTitle.substring(0, 57) + '...';
    }
    
    // Proper case formatting
    if (cleanTitle.length > 0) {
      // Capitalize first letter of each word for titles
      cleanTitle = cleanTitle
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Fallback titles in respective languages
    const fallbacks: Record<string, string> = {
      'en': 'Story Video',
      'hi': 'कहानी',
      'ta': 'கதை',
      'te': 'కథ',
      'mr': 'कथा',
      'bn': 'গল্প',
      'gu': 'વાર્તા',
      'kn': 'ಕಥೆ',
      'ml': 'കഥ',
      'or': 'କାହାଣୀ',
      'pa': 'ਕਹਾਣੀ',
      'as': 'কাহিনী',
      'ur': 'کہانی',
      'es': 'Historia',
      'fr': 'Histoire',
      'de': 'Geschichte',
      'ja': '物語',
      'ko': '이야기',
      'zh': '故事'
    };
    
    return cleanTitle || fallbacks[language] || fallbacks['en'];
  }

  private getOutroText(language: string): string {
    const outros: Record<string, string> = {
      'en': 'Thank you for watching! Like and subscribe for more amazing stories.',
      'hi': 'देखने के लिए धन्यवाद! अधिक कहानियों के लिए लाइक और सब्सक्राइब करें।',
      'ta': 'பார்த்ததற்கு நன்றி! மேலும் கதைகளுக்கு லைக் மற்றும் சப்ஸ்கிரைப் செய்யுங்கள்।',
      'te': 'చూసినందుకు ధన్యవాదాలు! మరిన్ని కథల కోసం లైక్ మరియు సబ్స్క్రైబ్ చేయండి।',
      'mr': 'पाहिल्याबद्दल धन्यवाद! अधिक कथांसाठी लाइक आणि सबस्क्राइब करा।',
      'bn': 'দেখার জন্য ধন্যবাদ! আরও গল্পের জন্য লাইক এবং সাবস্ক্রাইব করুন।',
      'gu': 'જોવા બદલ આભાર! વધુ વાર્તાઓ માટે લાઇક અને સબ્સ્ક્રાઇબ કરો।',
      'kn': 'ನೋಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ಹೆಚ್ಚಿನ ಕಥೆಗಳಿಗಾಗಿ ಲೈಕ್ ಮತ್ತು ಸಬ್ಸ್ಕ್ರೈಬ್ ಮಾಡಿ।',
      'ml': 'കണ്ടതിന് നന്ദി! കൂടുതൽ കഥകൾക്കായി ലൈക്ക് ചെയ്ത് സബ്സ്ക്രൈബ് ചെയ്യുക।',
      'or': 'ଦେଖିବା ପାଇଁ ଧନ୍ୟବାଦ! ଅଧିକ କାହାଣୀ ପାଇଁ ଲାଇକ୍ ଏବଂ ସବସ୍କ୍ରାଇବ୍ କରନ୍ତୁ।',
      'pa': 'ਦੇਖਣ ਲਈ ਧੰਨਵਾਦ! ਹੋਰ ਕਹਾਣੀਆਂ ਲਈ ਲਾਈਕ ਅਤੇ ਸਬਸਕ੍ਰਾਈਬ ਕਰੋ।',
      'as': 'চোৱাৰ বাবে ধন্যবাদ! অধিক কাহিনীৰ বাবে লাইক আৰু চাবস্ক্ৰাইব কৰক।',
      'ur': 'دیکھنے کے لیے شکریہ! مزید کہانیوں کے لیے لائک اور سبسکرائب کریں۔',
      'es': '¡Gracias por ver! Dale me gusta y suscríbete para más historias increíbles.',
      'fr': 'Merci d\'avoir regardé! Aimez et abonnez-vous pour plus d\'histoires incroyables.',
      'de': 'Danke fürs Zuschauen! Liken und abonnieren Sie für weitere tolle Geschichten.',
      'ja': 'ご視聴ありがとうございました！より多くの素晴らしいストーリーのために「いいね」と「チャンネル登録」をお願いします。',
      'ko': '시청해 주셔서 감사합니다! 더 많은 멋진 이야기를 위해 좋아요와 구독 부탁드립니다.',
      'zh': '感谢观看！请点赞和订阅以获取更多精彩故事。'
    };
    
    return outros[language] || outros['en'];
  }
  
  private renderTitle(titleLines: string[], titleLineHeight: number, titleFont: string, progress: number, startImg: HTMLImageElement | null, backgroundColor: string) {
    // Draw background (image or color)
    if (startImg) {
      this.ctx.drawImage(startImg, 0, 0, this.canvas.width, this.canvas.height);
      // Add overlay for better text readability
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Draw solid background color
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.font = titleFont;
    
    // Fade in effect for title
    let alpha = 1;
    if (progress < 0.2) {
      alpha = progress / 0.2; // Fade in over first 20% of title time
    } else if (progress > 0.8) {
      alpha = (1 - progress) / 0.2; // Fade out over last 20% of title time
    }
    
    this.ctx.globalAlpha = alpha;
    
    // Simple, elegant title design
    const centerY = this.canvas.height / 2;
        
    // Draw title text with subtle shadow and gradient
    titleLines.forEach((line, index) => {
      const y = centerY + (index * titleLineHeight) - (titleLines.length * titleLineHeight / 2);
      
      // Strong shadow for better readability
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetX = 4;
      this.ctx.shadowOffsetY = 4;
      
      // Set the text color explicitly from customization
      this.ctx.fillStyle = this.customization?.textColor || '#ffffff';
      this.ctx.fillText(line, this.canvas.width / 2, y);
    });
    
    // Reset styles
    this.ctx.globalAlpha = 1;
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  private renderOutro(outroLines: string[], outroLineHeight: number, outroFont: string, progress: number, outroImg: HTMLImageElement | null, backgroundColor: string) {
    // Always draw the outro image as background for outro
    if (outroImg) {
      this.ctx.drawImage(outroImg, 0, 0, this.canvas.width, this.canvas.height);
      // Add overlay for better text readability
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.font = outroFont;
    
    // Fade in effect for outro
    let alpha = 1;
    if (progress < 0.3) {
      alpha = progress / 0.3; // Fade in over first 30% of outro time
    }
    
    this.ctx.globalAlpha = alpha;
    
    const centerY = this.canvas.height / 2;
    
    // Draw outro text with elegant styling
    outroLines.forEach((line, index) => {
      const y = centerY + (index * outroLineHeight) - (outroLines.length * outroLineHeight / 2);
      
      // Strong shadow for better readability
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetX = 3;
      this.ctx.shadowOffsetY = 3;
      
      // Set the text color explicitly from customization
      this.ctx.fillStyle = this.customization?.textColor || '#ffffff';
      this.ctx.fillText(line, this.canvas.width / 2, y);
    });
    
    // Reset styles
    this.ctx.globalAlpha = 1;
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }
  private renderScrollAnimation(lines: string[], lineHeight: number, progress: number, totalHeight: number): boolean {
    // Background is already drawn in the main render loop
    
    // Set text color explicitly
    this.ctx.fillStyle = this.customization?.textColor || '#ffffff';
    
    // Calculate scroll phases - minimize pause time
    const scrollPhase = 0.9; // 90% of time for scrolling
    const pausePhase = 0.1; // 10% of time for final pause
    
    let scrollY: number;
    let isComplete = false;
    
    if (progress <= scrollPhase) {
      // Scrolling phase
      const scrollProgress = progress / scrollPhase;
      // Start text from bottom of screen and scroll up
      const scrollDistance = totalHeight + (this.canvas.height * 0.8); // Reduce scroll distance
      scrollY = this.canvas.height - (scrollProgress * scrollDistance);
    } else {
      // Pause phase - keep text at final position
      const scrollDistance = totalHeight + (this.canvas.height * 0.8);
      scrollY = this.canvas.height - scrollDistance;
      isComplete = true;
    }
    
    lines.forEach((line, index) => {
      // Start from bottom and scroll up
      const y = scrollY + (index * lineHeight);
      
      // Only render text that's visible on screen
      if (y > -lineHeight && y < this.canvas.height + lineHeight) {
        // Remove shadow - text color should be clearly visible
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(line, this.canvas.width / 2, y);
      }
    });
    
    return isComplete;
  }

  private renderFadeAnimation(lines: string[], lineHeight: number, progress: number): boolean {
    // Set text color explicitly
    this.ctx.fillStyle = this.customization?.textColor || '#ffffff';
    
    const linesPerScreen = Math.floor((this.canvas.height * 0.8) / lineHeight); // Use 80% of screen height
    const totalScreens = Math.ceil(lines.length / linesPerScreen);
    
    // Calculate which screen we're on
    const screenProgress = progress * totalScreens;
    const currentScreen = Math.floor(screenProgress);
    const withinScreenProgress = screenProgress % 1;
    
    // If we've shown all screens, show the last screen
    if (currentScreen >= totalScreens) {
      // Show final screen
      const startLine = Math.max(0, (totalScreens - 1) * linesPerScreen);
      const endLine = lines.length;
      
      this.ctx.globalAlpha = 1;
      
      for (let i = startLine; i < endLine; i++) {
        const y = this.canvas.height / 2 + ((i - startLine) * lineHeight) - ((endLine - startLine) * lineHeight / 2);
        
        // Remove shadow - text color should be clearly visible
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(lines[i], this.canvas.width / 2, y);
      }
      
      this.ctx.globalAlpha = 1;
      
      return true; // Animation complete
    }
    
    // Fade effect
    let alpha = 1;
    if (withinScreenProgress < 0.15) {
      alpha = withinScreenProgress / 0.15; // Fade in
    } else if (withinScreenProgress > 0.85) {
      alpha = (1 - withinScreenProgress) / 0.15; // Fade out
    }
    
    this.ctx.globalAlpha = alpha;
    
    const startLine = currentScreen * linesPerScreen;
    const endLine = Math.min(startLine + linesPerScreen, lines.length);
    
    for (let i = startLine; i < endLine; i++) {
      const y = this.canvas.height / 2 + ((i - startLine) * lineHeight) - ((endLine - startLine) * lineHeight / 2);
      
      // Remove shadow - text color should be clearly visible
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      
      this.ctx.fillText(lines[i], this.canvas.width / 2, y);
    }
    
    // Reset
    this.ctx.globalAlpha = 1;
    
    return false; // Animation not complete
  }

  private renderTypewriterAnimation(lines: string[], lineHeight: number, progress: number): boolean {
    // Set text color explicitly
    this.ctx.fillStyle = this.customization?.textColor || '#ffffff';
    
    const fullText = lines.join(' ');
    const totalChars = fullText.length;
    
    // Calculate typing phases
    const typingPhase = 0.9; // 90% of time for typing
    const pausePhase = 0.1; // 10% of time for final pause
    
    let currentChar: number;
    let isComplete = false;
    
    if (progress <= typingPhase) {
      // Typing phase
      const typingProgress = progress / typingPhase;
      currentChar = Math.floor(typingProgress * totalChars);
    } else {
      // Pause phase - show all text
      currentChar = totalChars;
      isComplete = true;
    }
    
    if (currentChar >= totalChars) {
      // Show all text
      lines.forEach((line, index) => {
        const y = this.canvas.height / 2 + (index * lineHeight) - (lines.length * lineHeight / 2);
        
        // Remove shadow - text color should be clearly visible
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(line, this.canvas.width / 2, y);
      });
      
      return isComplete;
    }
    
    let charCount = 0;
    const visibleLines: string[] = [];
    
    for (const line of lines) {
      if (charCount + line.length <= currentChar) {
        visibleLines.push(line);
        charCount += line.length + 1; // +1 for space
      } else if (charCount < currentChar) {
        const partialLine = line.substring(0, currentChar - charCount);
        visibleLines.push(partialLine);
        break;
      } else {
        break;
      }
    }
    
    visibleLines.forEach((line, index) => {
      const y = this.canvas.height / 2 + (index * lineHeight) - (visibleLines.length * lineHeight / 2);
      
      // Remove shadow - text color should be clearly visible
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      
      this.ctx.fillText(line, this.canvas.width / 2, y);
    });
    
    
    return false; // Animation not complete during typing phase
  }
  
  private wrapText(words: string[], maxWidth: number): string[] {
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}