// GPA calculator configuration
const GPA_COURSE_COUNT = 5;
const GPA_ALLOWED_GRADES = ['A', 'B', 'C', 'D', 'F'];

function getCourseIndices() {
  return Array.from({ length: GPA_COURSE_COUNT }, (_, idx) => idx + 1);
}

function installInputSanitizers() {
  const digitStripper = /[^0-9]/g;
  const validGradeSet = new Set(GPA_ALLOWED_GRADES);

  getCourseIndices().forEach((index) => {
    const creditBox = document.getElementById('ch' + index);
    const gradeBox = document.getElementById('g' + index);

    if (creditBox) {
      creditBox.addEventListener('input', () => {
        creditBox.value = creditBox.value.replace(digitStripper, '');
      });
    }

    if (gradeBox) {
      gradeBox.addEventListener('input', () => {
        const normalized = gradeBox.value.toUpperCase().slice(0, 1);
        gradeBox.value = validGradeSet.has(normalized) ? normalized : '';
      });
    }
  });
}

function focusFirstCreditBox() {
  const first = document.getElementById('ch1');
  if (first) {
    first.focus();
  }
}

// Map letter grades to points
function gradeToPoints(letter) {
  if (!letter) return null;
  const symbol = String(letter).trim().toUpperCase();
  switch (symbol) {
    case 'A': return 4.0;
    case 'B': return 3.0;
    case 'C': return 2.0;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return null;
  }
}

function readCourseInputs() {
  const credits = [];
  const grades = [];

  getCourseIndices().forEach((index) => {
    const creditField = document.getElementById('ch' + index);
    const gradeField = document.getElementById('g' + index);

    credits.push((creditField && creditField.value ? creditField.value : '').trim());
    grades.push((gradeField && gradeField.value ? gradeField.value : '').trim().toUpperCase().slice(0, 1));
  });

  return { credits, grades };
}

function computeGpaFromData(credits, grades) {
  let totalCredits = 0;
  let weightedPoints = 0;
  let contributingCourses = 0;

  for (let i = 0; i < GPA_COURSE_COUNT; i++) {
    const creditText = credits[i];
    const isWholeNumber = /^\d+$/.test(creditText);
    const hours = isWholeNumber ? parseInt(creditText, 10) : NaN;
    const gradePoints = gradeToPoints(grades[i]);

    if (!isNaN(hours) && hours > 0 && gradePoints !== null) {
      totalCredits += hours;
      weightedPoints += gradePoints * hours;
      contributingCourses++;
    }
  }

  return { totalCredits, weightedPoints, contributingCourses };
}

// Calculate GPA based on up to N entries; require at least 2 valid entries
function calculateGPA() {
  const { credits, grades } = readCourseInputs();
  const { totalCredits, weightedPoints, contributingCourses } = computeGpaFromData(credits, grades);
  const outputBox = document.getElementById('avgGpa');

  if (contributingCourses < 2 || totalCredits === 0) {
    if (outputBox) {
      outputBox.value = '';
    }
    alert('Please enter at least 2 valid course entries (credit hours and letter grade).');
    return;
  }

  const finalGpa = weightedPoints / totalCredits;
  if (outputBox) {
    outputBox.value = finalGpa.toFixed(2);
  }
}

// Reset all input boxes
function resetGPA() {
  getCourseIndices().forEach((index) => {
    const creditField = document.getElementById('ch' + index);
    const gradeField = document.getElementById('g' + index);
    if (creditField) creditField.value = '';
    if (gradeField) gradeField.value = '';
  });

  const outputBox = document.getElementById('avgGpa');
  if (outputBox) {
    outputBox.value = '';
  }

  focusFirstCreditBox();
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  focusFirstCreditBox();
  installInputSanitizers();
});

// Expose to global (used by inline handlers in gpa.html)
window.calculateGPA = calculateGPA;
window.resetGPA = resetGPA;
