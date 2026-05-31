%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% resume.cls — minimal CV class for the LaTeX Resume Builder
%
% Implements the commands used by the generated .tex:
%   \introduction[fullname=, address=, email=, phone=, linkedin=]
%   \summary{...}
%   educationSection / \educationItem[university=, graduation=, program=]
%   skillsSection / \skillItem[category=, skills=]
%   experienceSection / \experienceItem[company=, location=, position=, duration=]
%   \positionItem[position=, duration=]
%   \projectItem[title=, duration=, keyHighlight=]
%
% This is a clean reimplementation so the generated resume compiles out of the
% box with a standard TeX distribution. Tweak spacing/colors to taste.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2026/01/01 v1.0 Simple resume class]

\LoadClass[a4paper,10pt]{article}

\RequirePackage[T1]{fontenc}
\RequirePackage[utf8]{inputenc}
\RequirePackage[margin=1.4cm]{geometry}
\RequirePackage{keyval}
\RequirePackage{enumitem}
\RequirePackage{titlesec}
\RequirePackage{xcolor}
\RequirePackage{hyperref}
\RequirePackage{parskip}

\definecolor{accent}{HTML}{2C3E50}
\definecolor{rule}{HTML}{B8C2CC}

\hypersetup{colorlinks=true, urlcolor=accent, linkcolor=accent}

\pagestyle{empty}
\setlength{\parindent}{0pt}

% ---- Section headings -------------------------------------------------------
\titleformat{\section}
  {\large\bfseries\scshape\color{accent}}
  {}{0em}{}[{\color{rule}\titlerule[0.8pt]}]
\titlespacing*{\section}{0pt}{10pt}{5pt}

% ---- Bullet lists -----------------------------------------------------------
\setlist[itemize]{leftmargin=1.4em, topsep=2pt, itemsep=0pt, parsep=0pt}

% ---- Contact / header -------------------------------------------------------
\define@key{intro}{fullname}{\def\introfullname{#1}}
\define@key{intro}{address}{\def\introaddress{#1}}
\define@key{intro}{email}{\def\introemail{#1}}
\define@key{intro}{phone}{\def\introphone{#1}}
\define@key{intro}{linkedin}{\def\introlinkedin{#1}}

\newcommand{\contactsep}{\hspace{0.6em}\textcolor{rule}{\textbar}\hspace{0.6em}}

% Emit a separator before every contact part except the first present one,
% so an empty field (e.g. address) never leaves a dangling leading bar.
\newif\ifcvcontactfirst
\newcommand{\cvsep}{\ifcvcontactfirst\cvcontactfirstfalse\else\contactsep\fi}

\newcommand{\introduction}[1]{%
  \def\introfullname{}\def\introaddress{}\def\introemail{}%
  \def\introphone{}\def\introlinkedin{}%
  \setkeys{intro}{#1}%
  \begin{center}
    {\Huge\bfseries\color{accent}\introfullname}\\[5pt]
    {\small
      \cvcontactfirsttrue
      \ifx\introaddress\empty\else\cvsep\introaddress\fi
      \ifx\introemail\empty\else\cvsep\href{mailto:\introemail}{\introemail}\fi
      \ifx\introphone\empty\else\cvsep\introphone\fi
      \ifx\introlinkedin\empty\else\cvsep\href{https://\introlinkedin}{\introlinkedin}\fi
    }
  \end{center}
  \vspace{2pt}
}

% ---- Summary ----------------------------------------------------------------
\newcommand{\summary}[1]{\par#1\par\vspace{2pt}}

% ---- Education --------------------------------------------------------------
\newenvironment{educationSection}[1]{\section*{#1}}{\par}

\define@key{edu}{university}{\def\eduuniversity{#1}}
\define@key{edu}{graduation}{\def\edugraduation{#1}}
\define@key{edu}{program}{\def\eduprogram{#1}}

\newcommand{\educationItem}[1]{%
  \def\eduuniversity{}\def\edugraduation{}\def\eduprogram{}%
  \setkeys{edu}{#1}%
  \par\vspace{3pt}%
  {\textbf{\eduuniversity}\hfill \edugraduation}\\
  \textit{\eduprogram}\par
}

% ---- Skills (also used for Certifications & Languages) ----------------------
\newenvironment{skillsSection}[1]{\section*{#1}\begin{flushleft}}{\end{flushleft}}

\define@key{skill}{category}{\def\skillcategory{#1}}
\define@key{skill}{skills}{\def\skillskills{#1}}

\newcommand{\skillItem}[1]{%
  \def\skillcategory{}\def\skillskills{}%
  \setkeys{skill}{#1}%
  \textbf{\skillcategory:}~\skillskills%
}

% ---- Experience -------------------------------------------------------------
\newenvironment{experienceSection}[1]{\section*{#1}}{\par}

\define@key{exp}{company}{\def\expcompany{#1}}
\define@key{exp}{location}{\def\explocation{#1}}
\define@key{exp}{position}{\def\expposition{#1}}
\define@key{exp}{duration}{\def\expduration{#1}}

\newcommand{\experienceItem}[1]{%
  \def\expcompany{}\def\explocation{}\def\expposition{}\def\expduration{}%
  \setkeys{exp}{#1}%
  \par\vspace{5pt}%
  {\textbf{\expcompany}\hfill \expduration}\\
  \textit{\explocation}%
  \ifx\expposition\empty\else~\textbf{\textperiodcentered}~\textit{\expposition}\fi
  \par\vspace{2pt}%
}

\define@key{pos}{position}{\def\posposition{#1}}
\define@key{pos}{duration}{\def\posduration{#1}}

\newcommand{\positionItem}[1]{%
  \def\posposition{}\def\posduration{}%
  \setkeys{pos}{#1}%
  \par\vspace{3pt}%
  {\textit{\textbf{\posposition}}\hfill \posduration}\par\vspace{1pt}%
}

% ---- Projects ---------------------------------------------------------------
\define@key{proj}{title}{\def\projtitle{#1}}
\define@key{proj}{duration}{\def\projduration{#1}}
\define@key{proj}{keyHighlight}{\def\projhighlight{#1}}

\newcommand{\projectItem}[1]{%
  \def\projtitle{}\def\projduration{}\def\projhighlight{}%
  \setkeys{proj}{#1}%
  \par\vspace{5pt}%
  {\textbf{\projtitle}\hfill \projduration}\\
  \ifx\projhighlight\empty\else\textit{\projhighlight}\par\vspace{2pt}\fi
}

\endinput
