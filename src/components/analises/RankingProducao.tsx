import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, User, Layers } from "lucide-react";

interface RankingItem {
  nome: string;
  total: number;
  etapas: Record<string, number>;
}

interface Props {
  rankingDoc: RankingItem[];
  rankingLab: RankingItem[];
  onShowDetails: (item: RankingItem) => void;
}

export function RankingProducao({ rankingDoc, rankingLab, onShowDetails }: Props) {
  const renderRanking = (title: string, items: RankingItem[] = [], type: 'DOC' | 'LAB') => {
    const maxTotal = (items && items.length > 0) ? items[0].total : 1;
    const iconColor = type === 'DOC' ? 'text-blue-500 bg-blue-50' : 'text-orange-500 bg-orange-50';

    return (
      <Card className="flex-1 border-none shadow-sm h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${type === 'DOC' ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <Trophy className={`h-5 w-5 ${type === 'DOC' ? 'text-blue-500' : 'text-orange-500'}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm italic">Nenhuma etapa concluída no período.</div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => onShowDetails(item)}
                  className="space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all border border-transparent hover:border-blue-100 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-110 ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white' : 
                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' : 
                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index === 0 ? <Medal className="h-5 w-5" /> : index === 1 ? <Award className="h-5 w-5" /> : index === 2 ? <Award className="h-5 w-5" /> : index + 1}
                      </div>
                      <span className="font-bold text-sm text-gray-800">{item.nome}</span>
                    </div>
                    <Badge variant="secondary" className={`${iconColor} border-none font-bold px-3 py-1`}>
                      {item.total}
                    </Badge>
                  </div>
                  <Progress value={(item.total / maxTotal) * 100} className={`h-1.5 ${type === 'DOC' ? 'bg-blue-100 [&>div]:bg-blue-500' : 'bg-orange-100 [&>div]:bg-orange-500'}`} />
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-12">
                    {Object.entries(item.etapas).slice(0, 6).map(([label, count]) => (
                      <Badge key={label} variant="outline" className="text-[9px] font-medium bg-white/50 border-gray-200 text-gray-500 py-0 h-4">
                        {label}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {renderRanking("Ranking Dentistas", rankingDoc, 'DOC')}
      {renderRanking("Ranking Protéticos", rankingLab, 'LAB')}
    </div>
  );
}
