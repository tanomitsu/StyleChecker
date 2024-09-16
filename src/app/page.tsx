"use client"

import { AppearanceCheckResultView } from "@/components/AppearanceCheck"
import { parseAppearanceCheck } from "@/features/Parse"
import { AppearanceCheckProps } from "@/features/Parse/types"
import { Situation, situationToPrompt } from "@/features/Situation"
import { useChatGPT } from "@/hooks/useChatGPT"
import {
  Box,
  Flex,
  HStack,
  Image,
  useMediaQuery,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { useCallback, useMemo, useState } from "react"
import { FaCameraRetro, FaRedo } from "react-icons/fa"
import { Camera } from "react-camera-pro"
import { Title } from "@/components/Title"
import { SituationSelector } from "@/components/SituationSelector"
import { Loading } from "@/components/Loading"
import { MyIconButton } from "@/components/MyIconButton"
import { TwitterShareButton } from "@/components/TwitterShareButton"
import { generateShareText } from "@/features/Tweet"
import { useCamera2 } from "@/hooks/useCamera2"

export default function Home() {
  const { streamResponse, isLoading, output, reset } = useChatGPT()
  const toast = useToast()
  const [situation, setSituation] = useState<Situation | undefined>(undefined)
  const { takePhoto, retakePhoto, capturedPhoto, photoPreview, cameraRef } =
    useCamera2()

  const [isMobile] = useMediaQuery("(min-width: 768px)")

  const prompt = useMemo(() => {
    if (situation === undefined) {
      return ""
    }
    return situationToPrompt(situation)
  }, [situation])

  const onChangeSituation = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target
    if (value === "") {
      setSituation(undefined)
      return
    }
    setSituation(value as Situation)
  }

  const handleCheckButtonClick = useCallback(async () => {
    if (situation === undefined) {
      toast({
        description: "シチュエーションを選択してください。",
        status: "error",
        isClosable: true,
        position: "top",
      })
      return
    }

    try {
      const photoFile = await takePhoto()

      if (photoFile) {
        await streamResponse(prompt, photoFile)
      } else {
        toast({
          description: "写真の撮影に失敗しました。もう一度お試しください。",
          status: "warning",
          isClosable: true,
          position: "top",
        })
      }
    } catch (error) {
      console.error("Error during photo capture or streaming:", error)
      toast({
        description: "エラーが発生しました。もう一度お試しください。",
        status: "error",
        isClosable: true,
        position: "top",
      })
    }
  }, [situation, takePhoto, streamResponse, prompt, toast])

  const handleRetryButtonClick = useCallback(() => {
    retakePhoto()
    reset()
  }, [retakePhoto, reset])

  const checkResult = useMemo((): AppearanceCheckProps | undefined => {
    if (isLoading) {
      return undefined
    }
    return parseAppearanceCheck(output)
  }, [isLoading, output])

  return (
    <Box
      bgGradient="linear(to-r, #89aaff, #8bfff8)"
      minHeight="100vh"
      width="100%"
      p={4}
      pl={20}
      pr={20}
    >
      <VStack spacing={10}>
        <Title />
        <Box w={isMobile ? "50%" : "90%"} minW="300px">
          <SituationSelector onChangeSituation={onChangeSituation} />
        </Box>
        <Flex w="100%" direction={isMobile ? "row" : "column"} gap={4}>
          <Box w={isMobile ? "60%" : "100%"}>
            {photoPreview ? (
              <Box borderRadius="32px" overflow="hidden">
                <Image
                  src={photoPreview}
                  alt="Captured"
                  style={{
                    transform: "scaleX(-1)",
                    width: "100%",
                    height: "auto",
                  }}
                />
              </Box>
            ) : (
              <Box borderRadius="32px" overflow="hidden">
                <Camera
                  ref={cameraRef}
                  errorMessages={{
                    noCameraAccessible: "カメラが使えないみたい🥺",
                    permissionDenied: "カメラが使えないみたい🥺",
                    switchCamera: "カメラが使えないみたい🥺",
                    canvas: "カメラが表示できないみたい🥺",
                  }}
                  aspectRatio={4 / 3}
                />
              </Box>
            )}
          </Box>
          <Flex
            w={isMobile ? "38%" : "100%"}
            direction="column"
            bg="white"
            borderRadius="32px"
            p="32px"
            overflow="auto"
          >
            {isLoading ? (
              <Loading />
            ) : checkResult ? (
              <AppearanceCheckResultView
                result={checkResult}
                isLoading={isLoading}
              />
            ) : (
              <Box flex="1" />
            )}
          </Flex>
        </Flex>
        {capturedPhoto ? (
          <HStack>
            <MyIconButton
              onClick={handleRetryButtonClick}
              icon={<FaRedo />}
              ariaLabel="Retry"
            />
            {checkResult && (
              <TwitterShareButton
                url={window.location.href}
                text={generateShareText(checkResult)}
              />
            )}
          </HStack>
        ) : (
          <MyIconButton
            onClick={handleCheckButtonClick}
            icon={<FaCameraRetro />}
            ariaLabel="Check"
          />
        )}
      </VStack>
    </Box>
  )
}
