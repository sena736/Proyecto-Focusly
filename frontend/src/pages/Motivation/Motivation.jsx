import React from "react";
import { usePhrase } from "../../hooks/usePhrase";
import PageHeader from "../../components/layout/PageHeader/PageHeader";
import MotivationCard from "../../components/motivation/MotivationCard/MotivationCard";

const Motivation = () => {
	const { data: phrase, isLoading, isError, refetch, isRefetching } = usePhrase();

	if (isLoading) {
		return (
			<main className="motivation-page">
				<div className="motivation-page__loader">
					<span>Cargando frase motivacional...</span>
				</div>
			</main>
		);
	}

	if (isError) {
		return (
			<main className="motivation-page">
				<div className="motivation-page__error">
					<p>No se pudo cargar la frase motivacional.</p>
				</div>
			</main>
		);
	}

	return (
		<main className="motivation-page">
				<PageHeader
					title="Motivación"
					subtitle="Encuentra inspiración para continuar con tus objetivos."
				/>

			{phrase ? (
				<MotivationCard
					phrase={phrase}
					onNewPhrase={refetch}
					isRefreshing={isRefetching}
				/>
			) : (
				<div className="motivation-page__error">
					<p>No hay frases motivacionales disponibles.</p>
				</div>
			)}
		</main>
	);
};

export default Motivation;
