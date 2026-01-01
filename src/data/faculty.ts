export interface Faculty {
    name: string;
    university: string;
    title?: string;
    email?: string;
}

export const facultyList: Faculty[] = [
    // Cornell
    { name: "David Rand", university: "Cornell University", title: "Professor of Management Science and Brain and Cognitive Sciences" },
    { name: "Adam Seth Litwin", university: "Cornell University", title: "Associate Professor" },
    { name: "M. Diane Burton", university: "Cornell University", title: "Joseph R. Rich ’80 Professor" },
    { name: "Ben Rissing", university: "Cornell University", title: "Associate Professor" },
    { name: "Lisa Csencsits", university: "Cornell University", title: "Associate Director" },
    { name: "Karan Girotra", university: "Cornell University", title: "Professor of Operations Technology and Innovation" },
    { name: "Justin Johnson", university: "Cornell University", title: "Professor of Management" },
    { name: "Allan Filipowicz", university: "Cornell University", title: "Clinical Professor of Management and Organisations" },
    { name: "Rebecca Kehoe", university: "Cornell University", title: "Associate Prof, Human Resource Studies" },
    { name: "Bradford Bell", university: "Cornell University" },
    { name: "John Hausknecht", university: "Cornell University" },
    { name: "Tae Youn Park", university: "Cornell University" },
    { name: "Derek Cabrerra", university: "Cornell University" },
    { name: "Horst Abraham", university: "Cornell University" },
    { name: "Barbara Mink", university: "Cornell University" },
    { name: "Glen Dowell", university: "Cornell University" },
    { name: "Risa Mish", university: "Cornell University" },
    { name: "Tony Simons", university: "Cornell University" },
    { name: "Neil Tarallo", university: "Cornell University" },
    { name: "Michelle Duguid", university: "Cornell University" },
    { name: "Mor Namaan", university: "Cornell University" },
    { name: "Pamela Moulton", university: "Cornell University" },

    // Oxford (Saïd)
    { name: "Charlie Curtis", university: "Saïd Business School (Oxford)", title: "Associate Fellow and Entrepreneurship Expert" },
    { name: "Owen Darbshire", university: "Saïd Business School (Oxford)", title: "Associate Professor in Organisational Behaviour" },
    { name: "John Denton", university: "Saïd Business School (Oxford)", title: "Associate Fellow" },
    { name: "Trang Chu", university: "Saïd Business School (Oxford)", title: "Associate Fellow" },
    { name: "Paul Fisher", university: "Saïd Business School (Oxford)", title: "Programme Director" },
    { name: "Andrew Stephen", university: "Saïd Business School (Oxford)", title: "Professor of Marketing" },
    { name: "Abrar Choudhury", university: "Saïd Business School (Oxford)", title: "Senior Research Fellow" },
    { name: "Carissa Veliz", university: "Saïd Business School (Oxford)", title: "Associate Professor in Philosophy" },
    { name: "Joel Shapiro", university: "Saïd Business School (Oxford)", title: "Professor of Financial Economics" },
    { name: "Trudi Lang", university: "Saïd Business School (Oxford)", title: "Senior Fellow in Management Practice" },
    { name: "Sue Dopson", university: "Saïd Business School (Oxford)", title: "Professor of Organisational Behaviour" },
    { name: "Peter Hanke", university: "Saïd Business School (Oxford)", title: "Associate Fellow" },
    { name: "Nelisha Wickremasinghe", university: "Saïd Business School (Oxford)", title: "Leadership and Change Consultant" },
    { name: "Michael Smets", university: "Saïd Business School (Oxford)", title: "Professor of Management" },
    { name: "Allyson Stewart-Allen", university: "Saïd Business School (Oxford)", title: "Associate Fellow" },
    { name: "Alwin Smith", university: "Saïd Business School (Oxford)" },
    { name: "Anton Musgrave", university: "Saïd Business School (Oxford)" },
    { name: "Theomary Karamanis", university: "Saïd Business School (Oxford)" },
    { name: "Jamie Anderson", university: "Saïd Business School (Oxford)" },
    { name: "Doug Thomas", university: "Darden School of Business", title: "Henry E. McWane Professor of Business Administration" }, // Note: User listed Darden
    { name: "Daniel Murphy", university: "Darden School of Business", title: "Jung Family Associate Professor" },
    { name: "Rory McDonald", university: "Darden School of Business", title: "John Tyler Associate Professor" },
    { name: "Graeme Codrington", university: "Darden School of Business", title: "Global Futurist" },
    { name: "Andy Lopata", university: "Darden School of Business", title: "Professional Relationships Strategist" },
    { name: "Bidhan L. Parmar", university: "Darden School of Business", title: "Associate Dean" },
    { name: "Yael Grushka-Cockayne", university: "Darden School of Business", title: "Senior Associate Dean" },

    // Michigan Ross
    { name: "Dave Mayer", university: "Michigan Ross School of Business", title: "John H. Mitchell Professor" },
    { name: "Nigel Melville", university: "Michigan Ross School of Business", title: "Associate Professor of Technology and Operations" },
    { name: "Brad Killaly", university: "Michigan Ross School of Business", title: "Clinical Associate Professor of Strategy" },
    { name: "Maxim Sytch", university: "Michigan Ross School of Business", title: "Jack D. Sparks Whirlpool Corporation Research Professor" },
    { name: "S. Sriram", university: "Michigan Ross School of Business", title: "Associate Dean for Graduate Programs" },
    { name: "Lindy Greer", university: "Michigan Ross School of Business" },
    { name: "Jagadeesh Sividasan", university: "Michigan Ross School of Business" },
    { name: "Gretchen Spreitzer", university: "Michigan Ross School of Business" },

    // XED
    { name: "Olivier Tabatoni", university: "XED", title: "Professor of Finance and Strategy" }, // Also affiliated with Oxford as per bio
    { name: "Federico Quijada", university: "XED", title: "Professor of Technology" },
    { name: "Antoinette Dale Henderson", university: "XED", title: "Leadership and Change Expert" },
    { name: "Dr. Ariff Kachra", university: "XED" },

    // Others (Unclassified in my quick scan, mapping to primary or most likely based on list context)
    { name: "Gautam Ahuja", university: "Cornell University" }, // Famous strategy prof at Cornell
    { name: "Mike Grandinetti", university: "Unknown" },
    { name: "General George Casey", university: "Cornell University" }, // Often teaches at Johnson
    { name: "Frank Pasquale", university: "Unknown" }, // Law prof, often Cornell Tech affiliate?
    { name: "Navid Asgar", university: "Unknown" },

];
