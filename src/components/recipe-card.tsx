'use client';

import {
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { type CreateRecipeOutput, type Ingredient } from '@/ai/schemas';
import { Button } from './ui/button';
import { Trash2, RefreshCw, Minus, Plus } from 'lucide-react';
import { Badge } from './ui/badge';

type RecipeCardProps = {
  recipe: CreateRecipeOutput;
  onIngredientRemove: (ingredient: Ingredient) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  ingredientsChanged: boolean;
  servings: number;
  onServingsChange: (servings: number) => void;
};

export function RecipeCard({
  recipe,
  onIngredientRemove,
  onRegenerate,
  isRegenerating,
  ingredientsChanged,
  servings,
  onServingsChange
}: RecipeCardProps) {

  const scaleIngredient = (ingredient: Ingredient) => {
    const scaleFactor = servings / recipe.servings;
    const newQuantity = ingredient.quantity * scaleFactor;
    const displayQuantity = newQuantity % 1 !== 0 ? newQuantity.toFixed(2) : newQuantity;
    return `${displayQuantity} ${ingredient.unit || ''}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <CardHeader className="p-8 bg-secondary/30 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
               <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full px-3">Recipe</Badge>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-foreground">{recipe.title}</CardTitle>
            <p className="text-secondary-foreground max-w-2xl text-base leading-relaxed">
              {recipe.description}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-md p-1 h-11 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onServingsChange(Math.max(1, servings - 1))}
              disabled={servings <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 min-w-[70px] justify-center border-x border-border/50">
              <span className="text-base font-bold text-foreground">{servings}</span>
              <span className="text-[13px] text-secondary-foreground font-medium">Servings</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onServingsChange(servings + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Ingredients Column */}
        <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-border bg-secondary/10">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-secondary-foreground mb-6">Ingredients</h3>
          <ul className="space-y-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start justify-between group py-2 border-b border-border/30 last:border-0">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">{ingredient.name}</div>
                  <div className="text-[13px] text-secondary-foreground font-medium">
                    {scaleIngredient(ingredient)}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive" 
                  onClick={() => onIngredientRemove(ingredient)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Column */}
        <div className="lg:col-span-8 p-8 bg-card">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-secondary-foreground mb-6">How to Cook</h3>
          <div className="prose prose-sm dark:prose-invert prose-slate max-w-none prose-p:text-foreground prose-p:leading-relaxed prose-li:text-foreground prose-li:leading-relaxed prose-li:mb-4">
            <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
          </div>
        </div>
      </div>

      {ingredientsChanged && (
        <div className="p-6 bg-secondary/20 border-t border-border">
          <Button onClick={onRegenerate} disabled={isRegenerating} className="w-full h-11 text-sm font-semibold rounded-md">
            {isRegenerating ? (
              <>
                <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
