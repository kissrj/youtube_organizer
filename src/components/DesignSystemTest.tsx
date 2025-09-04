'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardActions } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Container } from './layout/Container'
import { Grid } from './layout/Grid'
import { Modal } from './feedback/Modal'
import { toast, useToast } from './feedback/Toast'
import { ToastProvider } from './feedback/Toast'

/**
 * Componente de teste para o Design System
 * Demonstra o uso de todos os componentes criados
 */
export function DesignSystemTest() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  // const { announceSuccess, announceError } = useToast()

  const handleButtonClick = (variant: string) => {
    toast({
      title: `Botão ${variant} clicado!`,
      description: `Este é um exemplo do botão ${variant}`,
      variant: variant as any,
    })
  }

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      toast({
        title: 'Input enviado!',
        description: `Valor: ${inputValue}`,
        variant: 'success',
      })
      setInputValue('')
    } else {
      toast({
        title: 'Erro!',
        description: 'Campo obrigatório não preenchido',
        variant: 'destructive',
      })
    }
  }

  return (
    <ToastProvider>
      <Container size="lg" padding="md" className="py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text mb-2">
              🎨 Design System Test
            </h1>
            <p className="text-muted">
              Teste dos componentes do novo Design System
            </p>
          </div>

          {/* Buttons Section */}
          <Card>
            <CardHeader>
              <CardTitle>Botões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => handleButtonClick('default')}>
                  Default
                </Button>
                <Button variant="destructive" onClick={() => handleButtonClick('destructive')}>
                  Destructive
                </Button>
                <Button variant="outline" onClick={() => handleButtonClick('outline')}>
                  Outline
                </Button>
                <Button variant="secondary" onClick={() => handleButtonClick('secondary')}>
                  Secondary
                </Button>
                <Button variant="ghost" onClick={() => handleButtonClick('ghost')}>
                  Ghost
                </Button>
                <Button variant="success" onClick={() => handleButtonClick('success')}>
                  Success
                </Button>
                <Button variant="warning" onClick={() => handleButtonClick('warning')}>
                  Warning
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Campo de Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Nome"
                  placeholder="Digite seu nome..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="Este campo é obrigatório"
                />
                <Button onClick={handleInputSubmit}>
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grid Layout Test */}
          <Card>
            <CardHeader>
              <CardTitle>Grid Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid cols={3} gap="md" responsive>
                {Array.from({ length: 6 }, (_, i) => (
                  <Card key={i} variant="elevated" className="p-4">
                    <CardContent className="p-0">
                      <h3 className="font-semibold">Card {i + 1}</h3>
                      <p className="text-sm text-muted">Conteúdo do card {i + 1}</p>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Modal Test */}
          <Card>
            <CardHeader>
              <CardTitle>Modal</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsModalOpen(true)}>
                Abrir Modal
              </Button>
            </CardContent>
          </Card>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Modal de Teste"
            description="Este é um exemplo do componente Modal do Design System"
          >
            <div className="space-y-4">
              <p className="text-muted">
                Este modal demonstra o uso do componente Modal com acessibilidade completa.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setIsModalOpen(false)}>
                  Fechar
                </Button>
                <Button variant="success" onClick={() => {
                  toast({
                    title: 'Ação executada!',
                    description: 'Modal action completed successfully',
                    variant: 'success',
                  })
                  setIsModalOpen(false)
                }}>
                  Confirmar
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </Container>
    </ToastProvider>
  )
}

export default DesignSystemTest