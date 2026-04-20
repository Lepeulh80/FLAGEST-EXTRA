import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate auth
    setTimeout(() => {
      onLogin({ id: '1', name: 'Admin FlaGest', role: 'Propriétaire', email });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mb-6 group hover:rotate-6 transition-transform cursor-default">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">FlaGest</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Gestion Multi-Magasins</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[40px] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="pt-10 px-8 text-center">
            <CardTitle className="text-2xl font-black tracking-tight">Bienvenue</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">Connectez-vous pour gérer vos points de vente.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Identifiant</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="admin@flagest.ci" 
                    className="pl-12 h-14 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all border-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mot de passe</label>
                  <button type="button" className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">Oublié ?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-12 h-14 bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 transition-all border-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/25 transition-all text-sm group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Sparkles className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                )}
                {isLoading ? 'Connexion...' : 'Se Connecter'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 px-8 py-6">
            <div className="flex items-center justify-center w-full space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Système Sécurisé par FlaGest Security</p>
            </div>
          </CardFooter>
        </Card>
        
        <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          FlaGest v2.0 • Propulsé par Google Cloud
        </p>
      </motion.div>
    </div>
  );
};
