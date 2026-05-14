import React from 'react';

interface Course {
  id: string;
  title: string;
  icon: string;
  category: string;
  levels: Level[];
}

interface Level {
  id: string;
  number: number;
  name: string;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  number: number;
  completed: boolean;
  completedAt: string | null;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  courseName: string;
  earnedAt: string;
}

interface CitizenCoursesCardProps {
  courses: Course[];
  badges: Badge[];
}

export const CitizenCoursesCard: React.FC<CitizenCoursesCardProps> = ({ courses, badges }) => {
  const totalModules = courses.reduce((acc, course) =>
    acc + course.levels.reduce((lvlAcc, level) => lvlAcc + level.modules.length, 0), 0
  );

  const completedModules = courses.reduce((acc, course) =>
    acc + course.levels.reduce((lvlAcc, level) =>
      lvlAcc + level.modules.filter(m => m.completed).length, 0), 0
  );

  return (
    <div className="p-6 border rounded-xl bg-white mt-4">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Cursos y Capacitación</h3>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
          <p className="text-sm text-gray-500">Cursos</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">{completedModules}</p>
          <p className="text-sm text-gray-500">Completados</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-purple-600">{badges.length}</p>
          <p className="text-sm text-gray-500">Insignias</p>
        </div>
      </div>

      {/* Cursos */}
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-3">
                {course.icon && (
                  <span className="text-2xl">{course.icon}</span>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">{course.title}</h4>
                  <p className="text-sm text-gray-500">{course.category}</p>
                </div>
              </div>

              {/* Niveles y Módulos */}
              <div className="space-y-2">
                {course.levels.map(level => (
                  <div key={level.id} className="text-sm">
                    <p className="font-medium text-gray-600">
                      Nivel {level.number}: {level.name}
                    </p>
                    <div className="ml-4 mt-1 space-y-1">
                      {level.modules.map(module => (
                        <div
                          key={module.id}
                          className={`text-xs flex items-center gap-2 ${
                            module.completed ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          <span>
                            {module.completed ? '✓' : '○'}
                          </span>
                          <span>{module.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No hay cursos iniciados</p>
      )}

      {/* Insignias */}
      {badges.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold text-gray-700 mb-3">Insignias obtenidas</h4>
          <div className="flex gap-2 flex-wrap">
            {badges.map(badge => (
              <div
                key={badge.id}
                className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center"
                title={badge.name}
              >
                <span className="text-lg">{badge.icon}</span>
                <p className="text-xs text-purple-700 mt-1">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};