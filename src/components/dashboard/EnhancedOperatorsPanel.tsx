import React from 'react';
import { Users, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export const EnhancedOperatorsPanel = ({ operators, isConnected: _isConnected }: any) => {
  return (
    <Card className="flex-1 min-h-0 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Operadores Activos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
              {operators?.length || 0} online
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-2 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-2">
            {operators?.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No hay operadores conectados</p>
              </div>
            ) : (
              operators?.map((op: any) => (
                <div key={op.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {op.initials}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        op.status === 'online' ? 'bg-emerald-500' :
                        op.status === 'busy' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{op.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {op.status === 'busy' ? 'En llamada / Atendiendo' : 'Disponible'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {op.status === 'busy' ? (
                      <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">
                        <PhoneCall className="w-3 h-3 mr-1" /> Ocupado
                      </Badge>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-50" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
