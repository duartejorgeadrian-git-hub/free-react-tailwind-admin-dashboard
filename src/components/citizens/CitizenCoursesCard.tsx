import React from 'react';
import { BookOpen, CheckCircle2, Trophy, Star, ChevronRight, Award, GraduationCap, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge as UIBadge } from '@/components/ui/badge';

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

  const globalProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="space-y-6 mt-6">
      {/* Resumen de Progreso General */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Progreso Académico
          </h3>
          <UIBadge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-1 rounded-full font-bold">
            {Math.round(globalProgress)}% COMPLETADO
          </UIBadge>
        </div>

        <Progress value={globalProgress} className="h-4 bg-slate-100 mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-blue-900">{courses.length}</p>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Cursos</p>
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-900">{completedModules}</p>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Módulos</p>
            </div>
          </div>

          <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-900">{badges.length}</p>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Insignias</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listado de Cursos con estilo de Tarjeta de App */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg text-slate-800 px-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> Cursos en curso
          </h4>
          {courses.length > 0 ? (
            courses.map(course => {
              const courseTotal = course.levels.reduce((acc, l) => acc + l.modules.length, 0);
              const courseDone = course.levels.reduce((acc, l) => acc + l.modules.filter(m => m.completed).length, 0);
              const courseProgress = (courseDone / courseTotal) * 100;

              return (
                <div key={course.id} className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                        {course.icon || '📚'}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h5>
                        <p className="text-xs font-medium text-slate-500">{course.category}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Progreso</span>
                      <span>{Math.round(courseProgress)}%</span>
                    </div>
                    <Progress value={courseProgress} className="h-2" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-medium italic">No hay cursos iniciados aún</p>
            </div>
          )}
        </div>

        {/* Colección de Insignias */}
        <div className="space-y-4">
           <h4 className="font-bold text-lg text-slate-800 px-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" /> Logros e Insignias
          </h4>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 h-full">
            {badges.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="group relative flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform cursor-help mb-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <Award className="w-3 h-3 text-amber-500" />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 text-center leading-tight uppercase tracking-tighter">
                      {badge.name}
                    </p>
                    {/* Tooltip simple al hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl z-10 text-center">
                      Ganada en: {badge.courseName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-300">
                <Trophy className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-medium">Aún no ha ganado insignias</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
